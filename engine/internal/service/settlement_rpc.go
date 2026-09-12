package service

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"errors"
	"io"
	"math/big"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
)

//go:embed data/settlement-artifact.json
var settlementBuild []byte
var settlementArtifact struct {
	ABI      json.RawMessage `json:"abi"`
	AtsABI   json.RawMessage `json:"atsAbi"`
	Bytecode string          `json:"bytecode"`
	Runtime  string          `json:"runtime"`
}
var settlementABI, atsHoldABI abi.ABI
var hashRE = regexp.MustCompile(`^0x[0-9a-f]{64}$`)
var partitionKey = common.BigToHash(big.NewInt(1))

func init() {
	if e := json.Unmarshal(settlementBuild, &settlementArtifact); e != nil {
		panic("invalid settlement artifact")
	}
	var e error
	settlementABI, e = abi.JSON(bytes.NewReader(settlementArtifact.ABI))
	if e != nil {
		panic("invalid settlement ABI")
	}
	atsHoldABI, e = abi.JSON(bytes.NewReader(settlementArtifact.AtsABI))
	if e != nil {
		panic("invalid ATS ABI")
	}
}

type wireTerms struct {
	MatchId       [32]byte
	SellerOrder   [32]byte
	BuyerOrder    [32]byte
	Seller        common.Address
	Buyer         common.Address
	Amount        *big.Int
	PriceTinybars *big.Int
	PreparedAt    *big.Int
	Expiry        *big.Int
	HoldId        *big.Int
}
type wireHold struct {
	Amount              *big.Int
	ExpirationTimestamp *big.Int
	Escrow              common.Address
	To                  common.Address
	Data                []byte
}
type wireKey struct {
	Partition   [32]byte
	TokenHolder common.Address
	HoldId      *big.Int
}

func asTerms(t SettlementTerms) wireTerms {
	return wireTerms{common.HexToHash(t.MatchID), common.HexToHash(t.SellerOrder), common.HexToHash(t.BuyerOrder), common.HexToAddress(t.Seller), common.HexToAddress(t.Buyer), big.NewInt(t.Amount), big.NewInt(t.Price), big.NewInt(t.PreparedAt), big.NewInt(t.Expiry), big.NewInt(t.HoldID)}
}
func asHold(v Settlement) wireHold {
	return wireHold{big.NewInt(v.Terms.Amount), big.NewInt(v.Terms.Expiry), common.HexToAddress(v.Contract), common.HexToAddress(v.Terms.Buyer), []byte{}}
}
func settlementCalldata(action string, v Settlement) (string, error) {
	var b []byte
	var e error
	switch action {
	case "lock":
		b, e = atsHoldABI.Pack("createHoldByPartition", partitionKey, asHold(v))
	case "register":
		b, e = settlementABI.Pack("register", asTerms(v.Terms))
	case "orphan":
		b, e = settlementABI.Pack("recoverOrphan", big.NewInt(v.Terms.HoldID))
	case "settle", "cancel", "reclaim":
		b, e = settlementABI.Pack(action, common.HexToHash(v.Digest))
	default:
		return "", errors.New("unknown settlement action")
	}
	return "0x" + common.Bytes2Hex(b), e
}

// Fixed public read services only. No signer, credentials, RPC write or caller URL.
var publicClient = &http.Client{Timeout: 10 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return errors.New("redirect refused") }}

func publicJSON(ctx context.Context, url string, body []byte, out any) error {
	method := "GET"
	if body != nil {
		method = "POST"
	}
	req, e := http.NewRequestWithContext(ctx, method, url, bytes.NewReader(body))
	if e != nil {
		return e
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	resp, e := publicClient.Do(req)
	if e != nil {
		return errors.New("public service unavailable")
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return errors.New("public service not indexed or offline")
	}
	raw, e := io.ReadAll(io.LimitReader(resp.Body, 2*1024*1024+1))
	if e != nil || len(raw) > 2*1024*1024 {
		return errors.New("public response too large")
	}
	return json.Unmarshal(raw, out)
}
func chainRead(ctx context.Context, method string, params any, out any) error {
	switch method {
	case "eth_chainId", "eth_getBlockByNumber", "eth_getTransactionByHash", "eth_getTransactionReceipt", "eth_getCode", "eth_call":
	default:
		return errors.New("read method not allowed")
	}
	body, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 1, "method": method, "params": params})
	var r struct {
		ID     int             `json:"id"`
		Result json.RawMessage `json:"result"`
		Error  json.RawMessage `json:"error"`
	}
	if e := publicJSON(ctx, "https://testnet.hashio.io/api", body, &r); e != nil {
		return e
	}
	if r.ID != 1 || len(r.Error) > 0 || len(r.Result) == 0 || string(r.Result) == "null" {
		return errors.New("chain response pending or unavailable")
	}
	return json.Unmarshal(r.Result, out)
}
func hexInt(v string) (int64, error) {
	n, e := strconv.ParseInt(strings.TrimPrefix(v, "0x"), 16, 64)
	if !strings.HasPrefix(v, "0x") || n < 0 {
		return 0, errors.New("invalid hex integer")
	}
	return n, e
}
func LatestSettlementBlock(ctx context.Context) (string, int64, error) {
	var chain string
	if e := chainRead(ctx, "eth_chainId", []any{}, &chain); e != nil || chain != "0x128" {
		return "", 0, errors.New("wrong or unavailable chain")
	}
	var b struct {
		Number    string
		Timestamp string
	}
	if e := chainRead(ctx, "eth_getBlockByNumber", []any{"latest", false}, &b); e != nil {
		return "", 0, e
	}
	n, e := hexInt(b.Number)
	if e != nil {
		return "", 0, e
	}
	t, e := hexInt(b.Timestamp)
	return strconv.FormatInt(n, 10), t, e
}

type chainTransaction struct {
	Hash        string
	From        string
	To          *string
	Input       string
	Value       string
	ChainID     string
	BlockHash   string
	BlockNumber string
}
type chainLog struct {
	Address         string
	Data            string
	Topics          []string
	LogIndex        string
	TransactionHash string
	BlockHash       string
	Removed         bool
}
type chainReceipt struct {
	TransactionHash string
	From            string
	To              *string
	Status          string
	BlockHash       string
	BlockNumber     string
	ContractAddress string
	Logs            []chainLog
}

func sameAddress(a, b string) bool { return strings.EqualFold(a, b) }
func pointerAddress(a *string) string {
	if a == nil {
		return ""
	}
	return strings.ToLower(*a)
}
func checkTransaction(o SettlementOperation, t chainTransaction) error {
	n, ok := new(big.Int).SetString(strings.TrimPrefix(t.Value, "0x"), 16)
	if !hashRE.MatchString(o.Hash) || t.Hash != o.Hash || !sameAddress(t.From, o.Sender) || pointerAddress(t.To) != o.To || t.ChainID != "0x128" || !strings.EqualFold(t.Input, o.Calldata) || !strings.HasPrefix(t.Value, "0x") || !ok || n.String() != o.Value {
		return errors.New("transaction differs from original intent")
	}
	return nil
}
func CheckSettlementHash(ctx context.Context, o SettlementOperation, hash string) error {
	if !hashRE.MatchString(hash) {
		return errors.New("invalid hash")
	}
	o.Hash = hash
	var t chainTransaction
	if e := chainRead(ctx, "eth_getTransactionByHash", []any{hash}, &t); e != nil {
		return e
	}
	return checkTransaction(o, t)
}
func exactChainEvent(r chainReceipt, addr string, a abi.ABI, name string, args ...any) (string, error) {
	event := a.Events[name]
	dataArgs := []any{}
	topics := []string{event.ID.Hex()}
	for i, input := range event.Inputs {
		if input.Indexed {
			t, e := abi.MakeTopics([]any{args[i]})
			if e != nil {
				return "", e
			}
			topics = append(topics, t[0][0].Hex())
		} else {
			dataArgs = append(dataArgs, args[i])
		}
	}
	data, e := event.Inputs.NonIndexed().Pack(dataArgs...)
	if e != nil {
		return "", e
	}
	found := []chainLog{}
	for _, l := range r.Logs {
		if sameAddress(l.Address, addr) && len(l.Topics) > 0 && l.Topics[0] == event.ID.Hex() {
			found = append(found, l)
		}
	}
	if len(found) != 1 {
		return "", errors.New("required event count differs")
	}
	l := found[0]
	if l.Removed || l.TransactionHash != r.TransactionHash || l.BlockHash != r.BlockHash || !strings.EqualFold(l.Data, "0x"+common.Bytes2Hex(data)) || strings.Join(l.Topics, ",") != strings.Join(topics, ",") {
		return "", errors.New("event fields differ")
	}
	n, e := hexInt(l.LogIndex)
	return strconv.FormatInt(n, 10), e
}
func contractCall(ctx context.Context, address, block string, a abi.ABI, name string, args ...any) ([]any, error) {
	b, e := a.Pack(name, args...)
	if e != nil {
		return nil, e
	}
	var raw string
	if e = chainRead(ctx, "eth_call", []any{map[string]string{"to": address, "data": "0x" + common.Bytes2Hex(b)}, block}, &raw); e != nil {
		return nil, e
	}
	return a.Unpack(name, common.FromHex(raw))
}
func checkFullHold(ctx context.Context, v Settlement, block string) error {
	t := v.Terms
	h, e := contractCall(ctx, Asset, block, atsHoldABI, "getHoldForByPartition", wireKey{partitionKey, common.HexToAddress(t.Seller), big.NewInt(t.HoldID)})
	if e != nil {
		return e
	}
	if len(h) != 7 || h[0].(*big.Int).Cmp(big.NewInt(t.Amount)) != 0 || h[1].(*big.Int).Cmp(big.NewInt(t.Expiry)) != 0 || !sameAddress(h[2].(common.Address).Hex(), v.Contract) || !sameAddress(h[3].(common.Address).Hex(), t.Buyer) || len(h[4].([]byte)) != 0 || len(h[5].([]byte)) != 0 || h[6].(uint8) != 0 {
		return errors.New("complete Hold differs")
	}
	return nil
}
func verifySettlementChain(ctx context.Context, o SettlementOperation, v Settlement, salt string) (SettlementEvidence, error) {
	p := SettlementEvidence{Hash: o.Hash, FeeTinybars: "0", PrincipalTinybars: "0", LogIndices: []string{}}
	var t chainTransaction
	var r chainReceipt
	if e := chainRead(ctx, "eth_getTransactionByHash", []any{o.Hash}, &t); e != nil {
		return p, e
	}
	if e := checkTransaction(o, t); e != nil {
		return p, e
	}
	if e := chainRead(ctx, "eth_getTransactionReceipt", []any{o.Hash}, &r); e != nil {
		return p, e
	}
	if r.TransactionHash != o.Hash || r.BlockHash != t.BlockHash || !hashRE.MatchString(r.BlockHash) || r.BlockNumber != t.BlockNumber || !sameAddress(r.From, o.Sender) || pointerAddress(r.To) != o.To || r.Status != "0x1" && r.Status != "0x0" {
		return p, errors.New("receipt differs")
	}
	block, e := hexInt(r.BlockNumber)
	if e != nil {
		return p, e
	}
	p.Block = strconv.FormatInt(block, 10)
	var b struct {
		Hash      string
		Timestamp string
	}
	if e = chainRead(ctx, "eth_getBlockByNumber", []any{r.BlockNumber, false}, &b); e != nil {
		return p, e
	}
	ts, e := hexInt(b.Timestamp)
	if e != nil || b.Hash != r.BlockHash {
		return p, errors.New("block differs")
	}
	p.Timestamp = strconv.FormatInt(ts, 10)
	p.Reverted = r.Status == "0x0"
	contract := v.Contract
	if o.Action == "deploy" {
		contract = strings.ToLower(r.ContractAddress)
	}
	p.Contract = contract
	if !(o.Action == "deploy" && p.Reverted) {
		var code string
		if e = chainRead(ctx, "eth_getCode", []any{contract, r.BlockNumber}, &code); e != nil {
			return p, e
		}
		if code != settlementArtifact.Runtime {
			return p, errors.New("pinned runtime differs")
		}
		got, e := contractCall(ctx, contract, r.BlockNumber, settlementABI, "marketSalt")
		if e != nil || got[0].([32]byte) != common.HexToHash(salt) {
			return p, errors.New("market salt differs")
		}
	}
	if !p.Reverted {
		var index string
		switch o.Action {
		case "deploy":
			index, e = exactChainEvent(r, contract, settlementABI, "Setup", common.HexToAddress(Admin), common.HexToHash(salt))
		case "lock":
			event := atsHoldABI.Events["HeldByPartition"]
			count := 0
			for _, l := range r.Logs {
				if sameAddress(l.Address, Asset) && len(l.Topics) > 0 && l.Topics[0] == event.ID.Hex() {
					m := map[string]any{}
					if e = event.Inputs.NonIndexed().UnpackIntoMap(m, common.FromHex(l.Data)); e != nil {
						return p, e
					}
					hold, ok := m["holdId"].(*big.Int)
					if !ok || !hold.IsInt64() || hold.Sign() < 1 {
						return p, errors.New("invalid Hold ID")
					}
					p.HoldID = hold.Int64()
					count++
				}
			}
			if count != 1 {
				return p, errors.New("Hold event missing")
			}
			v.Terms.HoldID = p.HoldID
			index, e = exactChainEvent(r, Asset, atsHoldABI, "HeldByPartition", common.HexToAddress(v.Terms.Seller), common.HexToAddress(v.Terms.Seller), partitionKey, big.NewInt(p.HoldID), asHold(v), []byte{})
			if e == nil {
				e = checkFullHold(ctx, v, r.BlockNumber)
			}
		case "register":
			index, e = exactChainEvent(r, contract, settlementABI, "Registered", common.HexToHash(v.Digest), common.HexToHash(v.Terms.MatchID), common.HexToAddress(v.Terms.Seller), common.HexToAddress(v.Terms.Buyer), big.NewInt(v.Terms.HoldID))
			if e == nil {
				e = checkFullHold(ctx, v, r.BlockNumber)
			}
		case "settle":
			index, e = exactChainEvent(r, contract, settlementABI, "Settled", common.HexToHash(v.Digest), common.HexToAddress(v.Terms.Seller), common.HexToAddress(v.Terms.Buyer), big.NewInt(v.Terms.Amount), big.NewInt(v.Terms.Amount*v.Terms.Price), big.NewInt(v.Terms.HoldID))
			p.PrincipalTinybars = strconv.FormatInt(v.Terms.Amount*v.Terms.Price, 10)
		case "cancel", "reclaim", "orphan":
			digest := common.HexToHash(v.Digest)
			if o.Action == "orphan" {
				digest = common.Hash{}
			}
			index, e = exactChainEvent(r, contract, settlementABI, "Returned", digest, common.HexToAddress(v.Terms.Seller), big.NewInt(v.Terms.HoldID), big.NewInt(v.Terms.Amount), ts >= v.Terms.Expiry)
		default:
			e = errors.New("unknown action")
		}
		if e != nil {
			return p, e
		}
		p.LogIndices = append(p.LogIndices, index)
		if o.Action == "settle" || o.Action == "cancel" || o.Action == "reclaim" || o.Action == "orphan" {
			args := []any{common.HexToAddress(v.Terms.Seller), partitionKey, big.NewInt(v.Terms.HoldID), big.NewInt(v.Terms.Amount)}
			name := "HoldByPartitionReleased"
			if o.Action == "settle" {
				name = "HoldByPartitionExecuted"
				args = append(args, common.HexToAddress(v.Terms.Buyer))
			} else if ts >= v.Terms.Expiry {
				name = "HoldByPartitionReclaimed"
				args = append([]any{common.HexToAddress(contract)}, args...)
			}
			index, e = exactChainEvent(r, Asset, atsHoldABI, name, args...)
			if e != nil {
				return p, e
			}
			p.LogIndices = append(p.LogIndices, index)
		}
		if o.Action != "deploy" && o.Action != "lock" && o.Action != "orphan" {
			expected := map[string]uint8{"register": 1, "settle": 2, "cancel": 3, "reclaim": 4}[o.Action]
			state, err := contractCall(ctx, contract, r.BlockNumber, settlementABI, "state", common.HexToHash(v.Digest))
			if err != nil || state[0].(uint8) != expected {
				return p, errors.New("on-chain state differs")
			}
		}
	}
	if o.Action != "deploy" {
		before, err := settlementBalances(ctx, v, "0x"+strconv.FormatInt(block-1, 16))
		if err != nil {
			return p, err
		}
		after, err := settlementBalances(ctx, v, r.BlockNumber)
		if err != nil {
			return p, err
		}
		if err = checkSettlementBalances(o.Action, v.Terms.Amount, p.Reverted, before, after); err != nil {
			return p, err
		}
		p.Before = &before
		p.After = &after
	}
	if e = verifySettlementMirror(ctx, o, v, &p); e != nil {
		return p, e
	}
	return p, nil
}

var publicAccountIDs = map[string]string{Admin: "0.0.10389090", Seller: "0.0.10389111", Buyer: "0.0.10389098"}

func verifySettlementMirror(ctx context.Context, o SettlementOperation, v Settlement, p *SettlementEvidence) error {
	var r struct {
		Hash               string
		BlockNumber        json.Number `json:"block_number"`
		FunctionParameters string      `json:"function_parameters"`
		Amount             json.Number
		Timestamp          string
		Result             string
		From               string
		To                 string
		ContractID         string `json:"contract_id"`
	}
	if e := publicJSON(ctx, "https://testnet.mirrornode.hedera.com/api/v1/contracts/results/"+o.Hash, nil, &r); e != nil {
		return e
	}
	amount, _ := new(big.Int).SetString(o.Value, 10)
	amount.Div(amount, big.NewInt(10000000000))
	result := "SUCCESS"
	if p.Reverted {
		result = "CONTRACT_REVERT_EXECUTED"
	}
	if r.Hash != o.Hash || r.BlockNumber.String() != p.Block || !strings.EqualFold(r.FunctionParameters, o.Calldata) || r.Amount.String() != amount.String() || r.Result != result || !regexp.MustCompile(`^[0-9]+\.[0-9]{9}$`).MatchString(r.Timestamp) || o.Action != "deploy" && !sameAddress(r.To, o.To) {
		return errors.New("Mirror execution differs")
	}
	var account struct {
		Account string
		Deleted bool
		EVM     string `json:"evm_address"`
	}
	// Resolve both Mirror's sender representation and the original alias. Never derive aliases from numeric IDs.
	for _, address := range []string{r.From, o.Sender} {
		if !regexp.MustCompile(`^0x[0-9a-fA-F]{40}$`).MatchString(address) {
			return errors.New("invalid public sender")
		}
		if e := publicJSON(ctx, "https://testnet.mirrornode.hedera.com/api/v1/accounts/"+address, nil, &account); e != nil {
			return e
		}
		if account.Deleted || account.Account != publicAccountIDs[o.Sender] {
			return errors.New("Mirror sender mapping differs")
		}
	}
	if !p.Reverted {
		var c struct {
			Deleted bool
			EVM     string `json:"evm_address"`
			ID      string `json:"contract_id"`
		}
		if e := publicJSON(ctx, "https://testnet.mirrornode.hedera.com/api/v1/contracts/"+p.Contract, nil, &c); e != nil {
			return e
		}
		if c.Deleted || !sameAddress(c.EVM, p.Contract) || c.ID == "" || o.Action == "deploy" && c.ID != r.ContractID {
			return errors.New("Mirror contract differs")
		}
	}
	var txs struct {
		Links        struct{ Next *string }
		Transactions []struct {
			Timestamp string `json:"consensus_timestamp"`
			Result    string
			ID        string      `json:"transaction_id"`
			Fee       json.Number `json:"charged_tx_fee"`
			Transfers []struct {
				Account string
				Amount  json.Number
			}
		}
	}
	if e := publicJSON(ctx, "https://testnet.mirrornode.hedera.com/api/v1/transactions?timestamp=eq:"+r.Timestamp+"&limit=100", nil, &txs); e != nil {
		return e
	}
	if txs.Links.Next != nil {
		return errors.New("Mirror transfers incomplete")
	}
	count := 0
	for _, t := range txs.Transactions {
		if t.Timestamp != r.Timestamp || t.Result != r.Result {
			continue
		}
		count++
		p.TransactionID = t.ID
		fee, e := strconv.ParseInt(t.Fee.String(), 10, 64)
		if e != nil || fee < 0 {
			return errors.New("invalid fee")
		}
		p.FeeTinybars = t.Fee.String()
		if o.Action == "settle" && !p.Reverted {
			credit, debit, total := new(big.Int), new(big.Int), new(big.Int)
			for _, x := range t.Transfers {
				n, ok := new(big.Int).SetString(x.Amount.String(), 10)
				if !ok {
					return errors.New("invalid transfer")
				}
				total.Add(total, n)
				if x.Account == publicAccountIDs[v.Terms.Seller] {
					credit.Add(credit, n)
				}
				if x.Account == publicAccountIDs[v.Terms.Buyer] {
					debit.Add(debit, n)
				}
			}
			principal := big.NewInt(v.Terms.Amount * v.Terms.Price)
			if credit.Cmp(principal) != 0 || debit.Cmp(new(big.Int).Neg(principal)) > 0 || total.Sign() != 0 {
				return errors.New("HBAR principal differs")
			}
		}
	}
	if count != 1 || p.TransactionID == "" {
		return errors.New("Mirror transaction incomplete")
	}
	return nil
}

func settlementBalances(ctx context.Context, v Settlement, block string) (SettlementBalances, error) {
	var result SettlementBalances
	c, e := contractCall(ctx, Asset, block, atsHoldABI, "getConfigInfo")
	if e != nil {
		return result, e
	}
	if len(c) != 3 || !sameAddress(c[0].(common.Address).Hex(), "0xba2d5fc2083a0b8f164c50e65d782087fba18e0a") || c[1].([32]byte) != partitionKey || c[2].(*big.Int).Cmp(big.NewInt(1)) != 0 {
		return result, errors.New("pinned asset configuration differs")
	}
	for name, want := range map[string]int64{"totalSupply": 100, "getMaxSupply": 1000} {
		r, e := contractCall(ctx, Asset, block, atsHoldABI, name)
		if e != nil || r[0].(*big.Int).Cmp(big.NewInt(want)) != 0 {
			return result, errors.New("asset supply or cap differs")
		}
	}
	values := []*string{&result.SellerAvailable, &result.SellerHeld, &result.BuyerAvailable, &result.BuyerHeld}
	for i, owner := range []string{v.Terms.Seller, v.Terms.Buyer} {
		available, e := contractCall(ctx, Asset, block, atsHoldABI, "balanceOf", common.HexToAddress(owner))
		if e != nil {
			return result, e
		}
		*values[i*2] = available[0].(*big.Int).String()
		held, e := contractCall(ctx, Asset, block, atsHoldABI, "getHeldAmountForByPartition", partitionKey, common.HexToAddress(owner))
		if e != nil {
			return result, e
		}
		*values[i*2+1] = held[0].(*big.Int).String()
	}
	return result, nil
}
func checkSettlementBalances(action string, amount int64, reverted bool, before, after SettlementBalances) error {
	a := []string{before.SellerAvailable, before.SellerHeld, before.BuyerAvailable, before.BuyerHeld}
	b := []string{after.SellerAvailable, after.SellerHeld, after.BuyerAvailable, after.BuyerHeld}
	delta := []int64{0, 0, 0, 0}
	if !reverted {
		switch action {
		case "lock":
			delta[0] = -amount
			delta[1] = amount
		case "settle":
			delta[1] = -amount
			delta[2] = amount
		case "cancel", "reclaim", "orphan":
			delta[0] = amount
			delta[1] = -amount
		}
	}
	for i, x := range a {
		n, ok := new(big.Int).SetString(x, 10)
		if !ok {
			return errors.New("invalid balance")
		}
		n.Add(n, big.NewInt(delta[i]))
		if n.Sign() < 0 || n.String() != b[i] {
			return errors.New("historical atomic balance transition differs")
		}
	}
	return nil
}
