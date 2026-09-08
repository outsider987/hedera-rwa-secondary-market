package engine

import (
	"encoding/hex"
	"testing"

	"github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
)

// Public EIP-712 eth_signTypedData example. No private key is read or instantiated.
// Source: https://eips.ethereum.org/EIPS/eip-712 (CC0).
const publicSignature = "0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307f996231605b915621c"

func TestPublicSignatureVector(t *testing.T) {
	data := apitypes.TypedData{Types: apitypes.Types{
		"EIP712Domain": {{Name: "name", Type: "string"}, {Name: "version", Type: "string"}, {Name: "chainId", Type: "uint256"}, {Name: "verifyingContract", Type: "address"}},
		"Person":       {{Name: "name", Type: "string"}, {Name: "wallet", Type: "address"}},
		"Mail":         {{Name: "from", Type: "Person"}, {Name: "to", Type: "Person"}, {Name: "contents", Type: "string"}},
	}, PrimaryType: "Mail", Domain: apitypes.TypedDataDomain{Name: "Ether Mail", Version: "1", ChainId: math.NewHexOrDecimal256(1), VerifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC"}, Message: apitypes.TypedDataMessage{"from": map[string]any{"name": "Cow", "wallet": "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"}, "to": map[string]any{"name": "Bob", "wallet": "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"}, "contents": "Hello, Bob!"}}
	hash, e := Digest(data)
	if e != nil {
		t.Fatal(e)
	}
	if hex.EncodeToString(hash) != "be609aee343fb3c4b28e1df9e632fca64fcfaede20f02e86244efddf30957bd2" {
		t.Fatal(hex.EncodeToString(hash))
	}
	owner, e := Recover(hash, publicSignature)
	if e != nil || owner != "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826" {
		t.Fatal(owner, e)
	}
	hash[0] ^= 1
	owner, e = Recover(hash, publicSignature)
	if e == nil && owner == "0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826" {
		t.Fatal("tampered digest verified")
	}
}
func TestOrderBinding(t *testing.T) {
	p := Prepared{Command: place("request", Seller, "Sell", 4, 9000000), Deadline: 301, PreparedAt: 1}
	p.ExpiresAt = 86401
	salt := "0x" + "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
	base, e := Digest(TypedData(p, salt))
	if e != nil {
		t.Fatal(e)
	}
	for _, field := range []string{"purpose", "action", "owner", "requestId", "orderId", "market", "side", "quantity", "price", "expiresAt", "deadline"} {
		d := TypedData(p, salt)
		switch field {
		case "owner":
			d.Message[field] = Buyer
		case "quantity", "price", "expiresAt", "deadline":
			d.Message[field] = "2"
		default:
			d.Message[field] = "changed"
		}
		h, e := Digest(d)
		if e != nil {
			t.Fatal(e)
		}
		if string(h) == string(base) {
			t.Fatal(field)
		}
	}
	for _, field := range []string{"name", "version", "chain", "salt"} {
		d := TypedData(p, salt)
		switch field {
		case "name":
			d.Domain.Name = "other"
		case "version":
			d.Domain.Version = "2"
		case "chain":
			d.Domain.ChainId = math.NewHexOrDecimal256(1)
		case "salt":
			d.Domain.Salt = "0x" + ID()
		}
		h, e := Digest(d)
		if e != nil || string(h) == string(base) {
			t.Fatal(field, e)
		}
	}
	for _, now := range []int64{0, 2, 301, 302} {
		if _, e := Verify(p, salt, publicSignature, now); e == nil {
			t.Fatal("wrong signer/deadline")
		}
	}
	// Shared project vector for the frontend's independent viem hash calculation.
	t.Logf("project digest: 0x%x", base)
}
