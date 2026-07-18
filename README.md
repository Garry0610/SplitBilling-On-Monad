# SplitBill — On-chain Bill Splitting for Friends

> Built for the BuildAnything "Spark" Hackathon (Monad)

## Team

- **Team name:** Garry's home
- **Builder:** Garry Yu (solo)

## 1. Description

SplitBill is a small on-chain app that lets a group of friends split a shared
expense (dinner, trip, group order) and settle up directly on Monad.
One person creates a "bill", adds the participants and each person's share, and
everyone pays their portion straight from their wallet. The bill's status
(who paid, who hasn't) lives entirely on-chain, so there's no argument about
who actually settled up.

## 2. Problem

Splitting a bill with friends is a small but constant annoyance:
- Someone always forgets to pay their share.
- "I already paid you back" disputes with no record.
- Manual tracking in a chat thread gets messy fast, especially recurring
  groups (roommates, weekly lunch group, trip squad).

## 3. Solution

SplitBill puts the source of truth on-chain:
1. A "bill" is created with a total amount and a list of participant
   addresses (equal split or custom shares).
2. Each participant pays their exact share directly to the contract in one
   transaction.
3. The contract tracks paid/unpaid status per participant — this is public
   and verifiable, so nobody can dispute whether they paid.
4. Once everyone has paid, the bill is marked settled and funds are released
   to the organizer.
5. If some participants never pay, the organizer can cancel the bill —
   anyone who already paid is automatically refunded, so funds never get
   stuck waiting on someone who won't pay.

This isn't a novelty use of blockchain — it's using the ledger for exactly
what it's good at: a shared, tamper-proof record of who owes what and who
already paid.

## 4. Live Links

| | |
|---|---|
| **Project URL** | https://split-billing-on-monad.vercel.app/ |
| **Github repo** | https://github.com/Garry0610/SplitBilling-On-Monad |
| **Category** | Monad Testnet |
| **Contract address** | 0x7aA08a633DFFc9028a6836935Cc2A9aAfBe8C44a |
| **Demo video** | `<link, ≤3 min>` |
| **Post URL** | `<social media post link>` |

## 5. Tech Stack

- **Smart contract:** Solidity, Foundry (`contracts/`)
- **Frontend:** Next.js + wagmi/viem + RainbowKit (`frontend/`)
- **Chain:** Monad Testnet

## 6. Repo Structure

```
splitbill-dapp/
├── contracts/          # Solidity contract + Foundry project
│   ├── src/             # SplitBill.sol
│   ├── test/            # Foundry tests
│   └── script/          # Deploy script
├── frontend/            # Next.js app
│   ├── app/              # Pages / routes
│   ├── components/       # UI components
│   └── lib/               # Contract ABI, wagmi config, helpers
└── docs/                # Demo script, screenshots, notes
```

## 7. Getting Started

### Contracts

```bash
cd contracts
forge install
forge build
forge test

# deploy to Monad testnet
forge script script/Deploy.s.sol \
  --rpc-url $MONAD_TESTNET_RPC \
  --private-key $PRIVATE_KEY \
  --broadcast
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # fill in contract address + RPC
npm run dev
```

## 8. Core Feature (what's actually real, not mocked)

- [x] Create a bill on-chain with participants + shares
- [x] Each participant pays their share in a real transaction
- [x] Paid/unpaid status is read live from the contract (not hardcoded)
- [x] Bill auto-marks as settled once fully paid
- [x] Organizer can cancel an unsettled bill, refunding anyone who already paid

## 9. Notes for Judges

- Development started after the hackathon kickoff — see commit history.
- No placeholder/mock data in the demo build; all bill and payment state is
  read from the deployed contract on Monad Testnet.
