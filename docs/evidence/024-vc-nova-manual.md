# Manual Seller VC and NOVA acceptance — September 7, 2026

Victor manually signed Seller VCs on dev and preview and approved one NOVA
creation on preview. Independent live verification of that transaction passed
all 56 receipt/event, current-state and Mirror comparisons. **T02 is complete;
T03 is not activated.** Base: `b526a75c2c089a735baa5dd7ecfdc331533a36cc`.

## Actual acceptance

The original screenshots show accepted Seller VCs and expired/tampered/
wrong-subject checks on both origins. The preview public export matches its
screenshot digest and the credential digest saved before NOVA creation. Full
VCs/signatures were not retained or independently replayed. Victor checked all
seven retained T01 boxes before the preview transaction. These are operator
attestations; screenshots do not independently reproduce every temporal check.
Entered versions: Chrome 152.0.7977.76 / MetaMask 13.46.1.

- Security ID: **0.0.10402368**; EVM address:
  `0x261ce349df182988fa25d00868cf6cf434220c24`.
- [Confirmed transaction on HashScan](https://hashscan.io/testnet/transaction/0xe1af1387ee185773e012a0e77b5c90ccffc5906ff46a1ac1dbb575b58c1ca05e).
- Hedera transaction ID: `0.0.7314364-1788760174-678049391`;
  consensus timestamp: `1788760179.255892685`.
- Exact Factory calldata/event match the reviewed parameters/config 1. Current
  metadata, cap 1000, supply 0, Admin default management role and queryable flags
  match. Rights/regulation rows explicitly use the confirmed deployment event,
  not a current Equity getter. The Mirror transaction ID is reported as returned;
  its payer identifier is not substituted for the verified EVM sender.

## Acceptance defect and repair

The initial export was `confirmed`, before full readback. Independent recovery
found one false mismatch: Mirror result.from was the numeric EVM form
`0x00000000000000000000000000000000009e8662`. Live account lookups for that
address and Admin's ECDSA alias both returned active account `0.0.10389090`.
Recovery now resolves the exact reported sender through Mirror and reuses
strict `validateMirrorAccount`. No ECDSA address is derived from an account ID.
Wrong/deleted mappings fail; missing mappings remain pending. Receipt, calldata,
event validation and the prohibition on another creation remain intact.

The regression failed before repair and passed afterward. `npm ci`, 65 app +
36 proto tests, typecheck and build passed; manifest/lock and all retained
patches are unchanged. All four live browser queries passed (dev/preview, 1440/390 px), each with
56 comparisons, no page errors or overflow and no wallet provider. The initial
dev attempt used a stale optimizer module after ci; restarting dev resolved
the import failure. The failed attempt is preserved in structured evidence. No new signatures or transactions were automated.

## Evidence and limits

[Structured public evidence](024-vc-nova-manual.json) preserves the original
exports, original mismatch and repaired live comparisons; [offline screenshots](024-vc-nova-gallery.html)
embed unchanged originals with a [SHA-256 manifest](024-vc-nova-gallery.json).
Native BBS remains excluded. The 62 audit findings, peer incompatibilities and
dfns license omissions remain disclosed. Only the one approved hash was
verified; this is not an exhaustive global uniqueness audit. No chain KYC,
issuance or Hold occurred in this work. Victor can reload preview and query the
saved hash to display the repaired result and export it again.
