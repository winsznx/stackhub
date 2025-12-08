# StacksHub

**The all-in-one Bitcoin-native superapp on Stacks**  
Message · Profile · Launch — all secured by Bitcoin via .btc identities, sBTC payments, and Clarity smart contracts.

**Live Demo**: https://stackshub.vercel.app  
**Backend**: https://stackshub.up.railway.app  
**Docs**: https://stackshub.dev

---

### The Vision

StacksHub is **Telegram + Farcaster + Pump.fun** — but fully on Bitcoin L2.  
No emails. No passwords. No centralized servers reading your data.

You are your **.btc name**.  
You own your messages (E2EE + Gaia).  
You launch tokens/NFTs in 60 seconds.  
You tip creators in **sBTC** (1 sat = 1 satoshi of real Bitcoin).

Built for the 2026 Stacks explosion — Nakamoto upgrade, sBTC live, Bitcoin L2 season in full swing.

---

### Core Features (MVP + Post-2025 Roadmap)

| Feature                  | Status       | Description                                                                                   |
|--------------------------|--------------|------------------------------------------------------------------------------------------------|
| .btc Native Login        | Live        | Connect Leather → instantly logged in as `you.btc`                                           |
| Encrypted Messaging      | Live        | E2EE DMs & groups using Stacks Encryption + Gaia (nobody can read, not even us)              |
| Real-time Chat           | Live        | Redis pub/sub via Railway → instant delivery                                                  |
| On-chain .btc Profiles   | Live        | Show NFTs, launched tokens, reputation, sBTC balance, STX stacked                             |
| No-code Launchpad        | Live        | Create SIP-021 tokens & SIP-015 NFTs in < 2 minutes (powered by Megapont forks)               |
| sBTC Payments & Tips     | Live        | Send real Bitcoin (as sBTC) in chat or profile — 1 satoshi tips with memos                    |
| Premium Gated Features   | Live        | Pay 0.01–0.1 sBTC to access elite groups or launch premium collections                        |
| AI Replies in Chat       | Coming Q1   | Grok/Claude-powered auto-replies & summaries (paid in sBTC)                                   |
| Prediction Markets       | Coming Q1   | No-code sBTC markets for launched tokens (sBTCMarket-inspired)                                |
| On-chain Quests & Badges | Coming Q1   | Earn NFTs for streaks, referrals, launches (Loopin/Skullcoin style)                           |

---

### Tech Stack (2025 Production Meta)

| Layer           | Technology                                                                 |
|-----------------|-----------------------------------------------------------------------------|
| Frontend        | Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui                |
| Auth            | Leather Wallet + .btc (BNS) resolution                                      |
| State           | Zustand (persisted)                                                         |
| Backend         | Node.js + Express + Drizzle ORM + PostgreSQL + Redis (Railway)             |
| Real-time       | Redis pub/sub + WebSockets                                                  |
| Blockchain      | Stacks Mainnet (Clarity SIP-021 / SIP-015) + sBTC                            |
| Storage         | Gaia (encrypted decentralized storage)                                      |
| Payments        | sBTC + STX (Hiro Payment API)                                               |
| Hosting         | Frontend → Vercel  Backend → Railway                                        |
| Contracts       | Clarinet + Megapont forks (auto-remapping for testnet/mainnet)              |

---

### Quick Start (Developer)

```bash
# Clone and setup
git clone https://github.com/stacks-hub/stacks-hub.git
cd stacks-hub

# Frontend (Vercel)
cd frontend
cp .env.example .env.local
# Add: NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
npm install
npm run dev

# Backend (Railway)
cd ../backend
cp .env.example .env
# Add DATABASE_URL, REDIS_URL (Railway auto-injects), STACKS_NETWORK=mainnet
npm install
npm run dev
```

Deploy in < 60 seconds:
- Push frontend → auto-deploys to Vercel
- Push backend → auto-deploys to Railway (Postgres + Redis included)

---

### Smart Contracts

```clarity
// launchpad.clar — SIP-021 tokens & SIP-015 NFTs
(define-public (create-token (name (string-ascii 32)) (supply uint))
  ...)

// reputation.clar — on-chain trust scores
(define-public (update-score (user principal) (delta int))
  ...)

// sbtc-gated features
(define-public (mint-premium-nft)
  (let ((balance (contract-call? .sbtc-token get-balance tx-sender)))
    (asserts! (>= balance u100000000) (err "Need 1 sBTC"))
    (contract-call? .sbtc-token transfer u100000000 tx-sender (as-contract tx-sender) none)
    (nft-mint? premium-nft (+ last-id u1) tx-sender)))
```

Deployed via Clarinet with **automatic sBTC principal remapping** (mainnet ↔ testnet).

---

### Monetization (Sustainable & Aligned)

| Source                  | Revenue Model                     |
|-------------------------|-----------------------------------|
| Token/NFT Launch Fees   | 0.5–2% in sBTC/STX (configurable) |
| Premium Groups          | Pay once or monthly in sBTC       |
| Chat Tips               | 1% platform cut (optional)        |
| AI Features             | Pay-per-use via sBTC (x402-ready) |
| Treasury                | All fees go to on-chain treasury  |

---

### Roadmap 2026

| Q1 2026             | Q2 2026                  | Q3 2026+                     |
|---------------------|--------------------------|------------------------------|
| AI agents in chat   | Mobile app (React Native)| DAO governance               |
| Prediction markets  | BNS subdomain auctions  | Cross-chain bridges (ETH/Base)|
| On-chain games      | Restaking integration    | StacksHub SDK for builders   |
| Talent Protocol sync| Stablecoin launchpad     | 1M+ users on Bitcoin L2      |

---

### Grants & Support

Eligible for:
- Stacks Foundation Grants ($50K–$250K) — social + DeFi focus
- Bitcoin Startup Lab
- Hiro Builder Rewards

Already pre-approved in multiple 2025 cohorts.

---

### Join the Movement

**Twitter/X**: [@StacksHub](https://twitter.com/stacks_hub)  
**Discord**: https://discord.gg/stackshub  
**Builders**: Open-source, MIT licensed — PRs welcome!

> **StacksHub is not just another dApp.**  
> It's the default home for everyone who owns a `.btc` name in 2026.

**Let’s build the future of Bitcoin social together.**

Made with ❤️ by Tim.  

**Ship it.**