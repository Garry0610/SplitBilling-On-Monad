# SplitBill Frontend

Next.js app for creating bills and paying your share on Monad Testnet.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_SPLITBILL_ADDRESS after deploying the contract
npm run dev
```

## Structure

- `app/` — pages: create bill, view bill / pay
- `components/` — wallet connect button, bill card, participant list, pay button
- `lib/wagmi.ts` — chain + wagmi config (confirm Monad testnet RPC/chain id in official docs before deploying)
- `lib/splitBillAbi.ts` — contract ABI + address, paste ABI after `forge build`

## Core screens (MVP)

1. **Create bill** — enter label, participant addresses, shares (or equal split toggle)
2. **Bill detail** — shows total, per-participant paid/unpaid status (live from contract), pay button for the connected wallet's own share
3. **Settled state** — once `settled == true` on-chain, show a clear "Settled ✅" state
