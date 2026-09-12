package matching

import (
	"encoding/json"
	"math"
	"reflect"
	"testing"
)

const seller = "0x1111111111111111111111111111111111111111"
const buyer = "0x2222222222222222222222222222222222222222"

func place(id, owner, side string, q, p int64) Command {
	return Command{id, id, owner, Market, "Place", side, q, p, 100}
}
func apply(t *testing.T, b *Book, c Command, now int64) Result {
	t.Helper()
	r, e := b.Apply(c, now)
	if e != nil {
		t.Fatal(e)
	}
	conserved(t, b)
	return r
}
func conserved(t *testing.T, b *Book) {
	t.Helper()
	for _, o := range b.Orders {
		if o.Quantity != o.Remaining+o.Matched+o.Cancelled+o.Expired || min(o.Remaining, o.Matched, o.Cancelled, o.Expired) < 0 {
			t.Fatalf("conservation: %+v", o)
		}
	}
}
func TestReplay(t *testing.T) {
	log := []Command{place("a", seller, "Sell", 4, 9000000), place("b", seller, "Sell", 5, 10000000), place("c", buyer, "Buy", 6, 10000000), {RequestID: "d", OrderID: "b", Owner: seller, Market: Market, Action: "Cancel"}, place("e", buyer, "Sell", 1, 10000000), place("f", seller, "Buy", 1, 10000000)}
	replay := func() (*Book, []Result) {
		b := &Book{}
		rs := []Result{}
		for i, c := range log {
			rs = append(rs, apply(t, b, c, int64(i+1)))
		}
		return b, rs
	}
	b, r := replay()
	other, rr := replay()
	if !reflect.DeepEqual(b, other) || !reflect.DeepEqual(r, rr) {
		t.Fatal("nondeterministic replay")
	}
	if len(r[2].Matches) != 2 || r[2].Matches[0].Quantity != 4 || r[2].Matches[1].Quantity != 2 || r[2].Matches[0].Notional+r[2].Matches[1].Notional != 56000000 || r[3].Order.Cancelled != 3 || r[3].Order.Matched != 2 {
		t.Fatal(r)
	}
	dup := apply(t, b, log[2], 90)
	if !reflect.DeepEqual(dup, r[2]) {
		t.Fatal("retry changed")
	}
	bad := log[2]
	bad.Quantity++
	before, _ := json.Marshal(b)
	if _, e := b.Apply(bad, 90); e == nil {
		t.Fatal("conflict accepted")
	}
	after, _ := json.Marshal(b)
	if string(before) != string(after) {
		t.Fatal("rejection mutated book")
	}
}
func TestPriority(t *testing.T) {
	for _, side := range []string{"Buy", "Sell"} {
		t.Run(side, func(t *testing.T) {
			b := &Book{}
			other := "Sell"
			p1, p2, limit := int64(12), int64(10), int64(15)
			if side == "Sell" {
				other = "Buy"
				p1, p2, limit = 10, 12, 9
			}
			apply(t, b, place("worse", seller, other, 1, p1), 1)
			apply(t, b, place("first", seller, other, 1, p2), 2)
			apply(t, b, place("second", seller, other, 2, p2), 3)
			r := apply(t, b, place("take", buyer, side, 2, limit), 4)
			if len(r.Matches) != 2 || r.Matches[0].Maker != "first" || r.Matches[1].Maker != "second" || r.Matches[0].Price != p2 || b.Orders[2].Remaining != 1 {
				t.Fatal(r)
			}
		})
	}
}
func TestSelfTradeAndExpiry(t *testing.T) {
	b := &Book{}
	apply(t, b, place("valid", seller, "Sell", 1, 9), 1)
	apply(t, b, place("self", buyer, "Sell", 1, 10), 2)
	apply(t, b, place("later", seller, "Sell", 1, 11), 3)
	r := apply(t, b, place("take", buyer, "Buy", 4, 12), 4)
	if len(r.Matches) != 1 || r.Order.Cancelled != 3 || b.Orders[2].Remaining != 1 {
		t.Fatal(r)
	}
	c := Command{RequestID: "bad", OrderID: "later", Owner: buyer, Market: Market, Action: "Cancel"}
	if _, e := b.Apply(c, 5); e == nil {
		t.Fatal("wrong owner")
	}
	if e := b.Expire(100); e != nil {
		t.Fatal(e)
	}
	conserved(t, b)
	if b.Orders[1].Expired != 1 {
		t.Fatal("expiry equality")
	}
	if _, e := b.Apply(place("expired", buyer, "Buy", 1, 1), 100); e == nil {
		t.Fatal("expired place")
	}
}
func TestBoundsAndNoncrossing(t *testing.T) {
	for _, s := range []string{"0", "01", "+1", "-1", "1.0", "1e2", "9223372036854775808", ""} {
		if _, e := Positive(s); e == nil {
			t.Fatal(s)
		}
	}
	if n, e := Positive("9223372036854775807"); e != nil || n != math.MaxInt64 {
		t.Fatal(n, e)
	}
	for _, v := range [][2]int64{{0, 1}, {1001, 1}, {1, 0}, {2, math.MaxInt64}} {
		if _, e := Notional(v[0], v[1]); e == nil {
			t.Fatal(v)
		}
	}
	b := &Book{}
	apply(t, b, place("ask", seller, "Sell", 3, 10), 1)
	r := apply(t, b, place("bid", buyer, "Buy", 4, 9), 2)
	if len(r.Matches) != 0 || r.Order.Remaining != 4 {
		t.Fatal(r)
	}
	c := place("regress", buyer, "Buy", 1, 10)
	if _, e := b.Apply(c, 1); e == nil {
		t.Fatal("time regression")
	}
}
func FuzzConservation(f *testing.F) {
	f.Add([]byte{1, 2, 3, 4, 5, 6, 7})
	f.Add([]byte{255, 0, 255, 0})
	f.Fuzz(func(t *testing.T, data []byte) {
		if len(data) > 99 {
			data = data[:99]
		}
		b := &Book{}
		for i, v := range data {
			side, owner := "Sell", seller
			if v%2 == 0 {
				side, owner = "Buy", buyer
			}
			c := place(string(rune(i+65)), owner, side, int64(v)%20+1, int64(v)%17+1)
			r := apply(t, b, c, int64(i+1))
			for _, m := range r.Matches {
				if (side == "Buy" && m.Price > c.Price) || (side == "Sell" && m.Price < c.Price) || m.Buyer == m.Seller {
					t.Fatal(m)
				}
			}
		}
		_ = b.Expire(200)
		conserved(t, b)
	})
}
