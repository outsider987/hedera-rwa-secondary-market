package service

import (
	"holdbook/engine/internal/matching"

	"encoding/hex"
	"errors"
	"math/big"
	"strconv"
	"strings"

	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
)

const Seller = "0x740e4ef58151a169621622577a5b6d6ff5010836"
const Buyer = "0xa1f2872ee7a9f74523ae0887a9dc428ff1340706"
const Purpose = "Unfunded intent only. No assets reserved or transferred."
const Origin = "http://127.0.0.1:4173"

type Prepared struct {
	matching.Command
	Deadline   int64 `json:"deadline,string"`
	PreparedAt int64 `json:"preparedAt,string"`
}

func Eligible(owner string) bool { return owner == Seller || owner == Buyer }
func TypedData(p Prepared, salt string) apitypes.TypedData {
	return apitypes.TypedData{
		Types: apitypes.Types{
			"EIP712Domain": {{Name: "name", Type: "string"}, {Name: "version", Type: "string"}, {Name: "chainId", Type: "uint256"}, {Name: "salt", Type: "bytes32"}},
			"OrderCommand": {{Name: "purpose", Type: "string"}, {Name: "action", Type: "string"}, {Name: "owner", Type: "address"}, {Name: "requestId", Type: "string"}, {Name: "orderId", Type: "string"}, {Name: "market", Type: "string"}, {Name: "side", Type: "string"}, {Name: "quantity", Type: "uint256"}, {Name: "price", Type: "uint256"}, {Name: "expiresAt", Type: "uint256"}, {Name: "deadline", Type: "uint256"}},
		}, PrimaryType: "OrderCommand",
		Domain:  apitypes.TypedDataDomain{Name: "HoldBook Unfunded Orders", Version: "1", ChainId: math.NewHexOrDecimal256(296), Salt: salt},
		Message: apitypes.TypedDataMessage{"purpose": Purpose, "action": p.Action, "owner": p.Owner, "requestId": p.RequestID, "orderId": p.OrderID, "market": p.Market, "side": p.Side, "quantity": strconv.FormatInt(p.Quantity, 10), "price": strconv.FormatInt(p.Price, 10), "expiresAt": strconv.FormatInt(p.ExpiresAt, 10), "deadline": strconv.FormatInt(p.Deadline, 10)},
	}
}
func Digest(data apitypes.TypedData) ([]byte, error) {
	h, _, e := apitypes.TypedDataAndHash(data)
	return h, e
}
func Recover(hash []byte, signature string) (string, error) {
	if len(hash) != 32 || len(signature) != 132 || !strings.HasPrefix(signature, "0x") {
		return "", errors.New("invalid signature encoding")
	}
	sig, e := hex.DecodeString(signature[2:])
	if e != nil {
		return "", errors.New("invalid signature encoding")
	}
	if sig[64] >= 27 {
		sig[64] -= 27
	}
	if sig[64] > 1 {
		return "", errors.New("invalid recovery ID")
	}
	// Reject malleable high-S signatures before recovery.
	if !crypto.ValidateSignatureValues(sig[64], new(big.Int).SetBytes(sig[:32]), new(big.Int).SetBytes(sig[32:64]), true) {
		return "", errors.New("invalid signature values")
	}
	key, e := crypto.SigToPub(hash, sig)
	if e != nil {
		return "", errors.New("signature recovery failed")
	}
	return strings.ToLower(crypto.PubkeyToAddress(*key).Hex()), nil
}
func Verify(p Prepared, salt, signature string, now int64) (string, error) {
	if !Eligible(p.Owner) || p.Market != matching.Market || p.Deadline != p.PreparedAt+300 || now >= p.Deadline || now < p.PreparedAt {
		return "", errors.New("invalid owner, market or deadline")
	}
	h, e := Digest(TypedData(p, salt))
	if e != nil {
		return "", e
	}
	owner, e := Recover(h, signature)
	if e != nil || owner != p.Owner {
		return "", errors.New("signature does not verify for owner")
	}
	return "0x" + hex.EncodeToString(h), nil
}
