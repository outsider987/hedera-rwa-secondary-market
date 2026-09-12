package service

import (
	"github.com/ethereum/go-ethereum/common"
	"strings"
	"testing"
)

func TestSettlementTransactionBinding(t *testing.T) {
	to := "0x" + strings.Repeat("1", 40)
	h := "0x" + strings.Repeat("2", 64)
	o := SettlementOperation{Hash: h, Sender: Buyer, To: to, Calldata: "0x12345678", Value: "200000000000000000"}
	tx := chainTransaction{Hash: h, From: Buyer, To: &to, Input: o.Calldata, Value: "0x2c68af0bb140000", ChainID: "0x128"}
	if e := checkTransaction(o, tx); e != nil {
		t.Fatal(e)
	}
	for _, field := range []string{"sender", "to", "value", "chain", "input", "hash"} {
		x := tx
		switch field {
		case "sender":
			x.From = Seller
		case "to":
			x.To = nil
		case "value":
			x.Value = "0x1312d00"
		case "chain":
			x.ChainID = "0x1"
		case "input":
			x.Input = "0x"
		case "hash":
			x.Hash = "0x" + strings.Repeat("3", 64)
		}
		if checkTransaction(o, x) == nil {
			t.Fatal("accepted", field)
		}
	}
}
func TestSettlementExactEventRejectsDuplicateRemovedAndWrongArguments(t *testing.T) {
	e := settlementABI.Events["Setup"]
	salt := common.HexToHash("0x" + strings.Repeat("1", 64))
	data, _ := e.Inputs.NonIndexed().Pack(salt)
	r := chainReceipt{TransactionHash: "0x" + strings.Repeat("2", 64), BlockHash: "0x" + strings.Repeat("3", 64)}
	log := chainLog{Address: Asset, Data: "0x" + common.Bytes2Hex(data), Topics: []string{e.ID.Hex(), common.BytesToHash(common.HexToAddress(Admin).Bytes()).Hex()}, TransactionHash: r.TransactionHash, BlockHash: r.BlockHash, LogIndex: "0x1"}
	r.Logs = []chainLog{log}
	if _, err := exactChainEvent(r, Asset, settlementABI, "Setup", common.HexToAddress(Admin), salt); err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 4; i++ {
		bad := log
		r.Logs = []chainLog{bad}
		switch i {
		case 0:
			r.Logs = append(r.Logs, bad)
		case 1:
			r.Logs[0].Removed = true
		case 2:
			r.Logs[0].TransactionHash = "0x0"
		case 3:
			r.Logs[0].Data = "0x"
		}
		if _, err := exactChainEvent(r, Asset, settlementABI, "Setup", common.HexToAddress(Admin), salt); err == nil {
			t.Fatal("bad event accepted", i)
		}
	}
}
func TestSettlementHistoricalBalanceTransitions(t *testing.T) {
	before := SettlementBalances{"84", "2", "16", "0"}
	for _, x := range []struct {
		action string
		after  SettlementBalances
	}{{"settle", SettlementBalances{"84", "0", "18", "0"}}, {"cancel", SettlementBalances{"86", "0", "16", "0"}}, {"reclaim", SettlementBalances{"86", "0", "16", "0"}}, {"orphan", SettlementBalances{"86", "0", "16", "0"}}, {"register", before}} {
		if e := checkSettlementBalances(x.action, 2, false, before, x.after); e != nil {
			t.Fatal(x.action, e)
		}
		bad := x.after
		bad.BuyerHeld = "1"
		if checkSettlementBalances(x.action, 2, false, before, bad) == nil {
			t.Fatal("unrelated held change accepted")
		}
	}
	if checkSettlementBalances("settle", 2, true, before, before) != nil {
		t.Fatal("revert state rejected")
	}
	if checkSettlementBalances("settle", 2, true, before, SettlementBalances{"84", "0", "18", "0"}) == nil {
		t.Fatal("revert with changed balances accepted")
	}
}
