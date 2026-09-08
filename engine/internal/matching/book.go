// Package matching matches unfunded intents. It never reserves or transfers assets.
package matching

import (
	"errors"
	"fmt"
	"math"
	"regexp"
	"slices"
	"strconv"
)

const Market = "NOVA/HBAR"

var decimal = regexp.MustCompile(`^[1-9][0-9]*$`)
var address = regexp.MustCompile(`^0x[0-9a-f]{40}$`)

func Positive(s string) (int64, error) {
	if !decimal.MatchString(s) {
		return 0, errors.New("expected canonical positive integer")
	}
	n, err := strconv.ParseInt(s, 10, 64)
	return n, err
}
func Notional(q, p int64) (int64, error) {
	if q < 1 || q > 1000 || p < 1 || p > math.MaxInt64/q {
		return 0, errors.New("quantity, price or notional out of range")
	}
	return q * p, nil
}

type Command struct {
	RequestID string `json:"requestId"`
	OrderID   string `json:"orderId"`
	Owner     string `json:"owner"`
	Market    string `json:"market"`
	Action    string `json:"action"`
	Side      string `json:"side"`
	Quantity  int64  `json:"quantity,string"`
	Price     int64  `json:"price,string"`
	ExpiresAt int64  `json:"expiresAt,string"`
}
type Order struct {
	Command
	Sequence   int64  `json:"sequence,string"`
	AcceptedAt int64  `json:"acceptedAt,string"`
	Remaining  int64  `json:"remaining,string"`
	Matched    int64  `json:"matched,string"`
	Cancelled  int64  `json:"cancelled,string"`
	Expired    int64  `json:"expired,string"`
	Reason     string `json:"reason"`
}
type Match struct {
	ID       string `json:"id"`
	Maker    string `json:"maker"`
	Taker    string `json:"taker"`
	Buyer    string `json:"buyer"`
	Seller   string `json:"seller"`
	Quantity int64  `json:"quantity,string"`
	Price    int64  `json:"price,string"`
	Notional int64  `json:"notional,string"`
	Time     int64  `json:"time,string"`
	Status   string `json:"status"`
}
type Result struct {
	Sequence int64   `json:"sequence,string"`
	Time     int64   `json:"time,string"`
	Order    Order   `json:"order"`
	Matches  []Match `json:"matches"`
}
type Receipt struct {
	Command Command
	Result  Result
}

// Book is owned by one serialized caller. The service locks the market row.
type Book struct {
	Sequence int64
	Time     int64
	Orders   []Order
	Receipts map[string]Receipt
}

func (b *Book) Expire(now int64) error {
	if now < b.Time {
		return errors.New("time moved backwards")
	}
	for i := range b.Orders {
		o := &b.Orders[i]
		if o.ExpiresAt <= now && o.Remaining > 0 {
			o.Expired += o.Remaining
			o.Remaining = 0
			o.Reason = "Expired"
		}
	}
	b.Time = now
	return nil
}
func (b *Book) Apply(c Command, now int64) (Result, error) {
	if r, ok := b.Receipts[c.RequestID]; ok {
		if r.Command != c {
			return Result{}, errors.New("conflicting request ID")
		}
		return r.Result, nil
	}
	if now < b.Time || now < 1 || b.Sequence == math.MaxInt64 || c.RequestID == "" || c.OrderID == "" || !address.MatchString(c.Owner) || c.Market != Market {
		return Result{}, errors.New("invalid command")
	}
	target := -1
	for i, o := range b.Orders {
		if o.OrderID == c.OrderID {
			target = i
			break
		}
	}
	switch c.Action {
	case "Place":
		if _, err := Notional(c.Quantity, c.Price); err != nil {
			return Result{}, err
		}
		if target != -1 || (c.Side != "Buy" && c.Side != "Sell") || c.ExpiresAt <= now {
			return Result{}, errors.New("invalid place")
		}
	case "Cancel":
		if target < 0 || b.Orders[target].Owner != c.Owner || c.Side != "" || c.Quantity != 0 || c.Price != 0 || c.ExpiresAt != 0 {
			return Result{}, errors.New("invalid cancel or owner")
		}
	default:
		return Result{}, errors.New("unknown action")
	}
	_ = b.Expire(now)
	b.Sequence++
	result := Result{Sequence: b.Sequence, Time: now, Matches: []Match{}}
	if c.Action == "Cancel" {
		o := &b.Orders[target]
		o.Cancelled += o.Remaining
		o.Remaining = 0
		if o.Cancelled > 0 {
			o.Reason = "Cancelled"
		}
		result.Order = *o
	} else {
		incoming := Order{Command: c, Sequence: b.Sequence, AcceptedAt: now, Remaining: c.Quantity}
		candidates := []int{}
		for i, o := range b.Orders {
			if o.Remaining > 0 && o.Side != c.Side && ((c.Side == "Buy" && c.Price >= o.Price) || (c.Side == "Sell" && c.Price <= o.Price)) {
				candidates = append(candidates, i)
			}
		}
		// ponytail: sort the small single-market book per command; price queues if measured scale requires them.
		slices.SortFunc(candidates, func(i, j int) int {
			a, z := b.Orders[i], b.Orders[j]
			if a.Price == z.Price {
				if a.Sequence < z.Sequence {
					return -1
				}
				return 1
			}
			if (c.Side == "Buy" && a.Price < z.Price) || (c.Side == "Sell" && a.Price > z.Price) {
				return -1
			}
			return 1
		})
		for _, i := range candidates {
			if incoming.Remaining == 0 {
				break
			}
			o := &b.Orders[i]
			if o.Owner == c.Owner {
				incoming.Cancelled = incoming.Remaining
				incoming.Remaining = 0
				incoming.Reason = "Self-trade prevention"
				break
			}
			q := min(incoming.Remaining, o.Remaining)
			n, _ := Notional(q, o.Price)
			m := Match{ID: fmt.Sprintf("%d-%d", b.Sequence, len(result.Matches)+1), Maker: o.OrderID, Taker: c.OrderID, Quantity: q, Price: o.Price, Notional: n, Time: now, Status: "Matched · Not settled", Buyer: c.Owner, Seller: o.Owner}
			if c.Side == "Sell" {
				m.Buyer = o.Owner
				m.Seller = c.Owner
			}
			o.Remaining -= q
			o.Matched += q
			incoming.Remaining -= q
			incoming.Matched += q
			result.Matches = append(result.Matches, m)
		}
		b.Orders = append(b.Orders, incoming)
		result.Order = incoming
	}
	if b.Receipts == nil {
		b.Receipts = map[string]Receipt{}
	}
	b.Receipts[c.RequestID] = Receipt{c, result}
	return result, nil
}

// ValidAddress checks the canonical lowercase address format used by the book.
func ValidAddress(value string) bool { return address.MatchString(value) }
