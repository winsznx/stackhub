# StacksHub

**The all-in-one Bitcoin-native superapp on Stacks**  
Message · Profile · Launch · Marketplace — secured by Bitcoin.

**Live Demo**: https://stackshub.vercel.app  

---

### The Vision

StacksHub is **Telegram + Farcaster + Pump.fun** — but fully on Bitcoin L2.  
No emails. No passwords. No centralized servers reading your data.

You are your **.btc name**.  
You own your messages.  
You launch tokens/NFTs in 60 seconds.  

---

### Core Features

| Feature                  | Status       | Description                                                                                   |
|--------------------------|--------------|------------------------------------------------------------------------------------------------|
| **.btc Native Login**    | 🟢 Live      | Connect Leather/Xverse → instantly logged in as `you.btc`                                    |
| **On-chain Profiles**    | 🟢 Live      | Real-time fetching of **sBTC/STX balances**, **NFTs**, and **Transaction History**.          |
| **Avatar Marketplace**   | 🟢 Live      | Interactive NFT Marketplace. Mint unique StacksHub Avatars (100 Supply).                     |
| **Encrypted Messaging**  | 🟡 Beta      | Real-time chat interface (Powered by Socket.io/Redis).                                       |
| **Launchpad**            | 🚧 Building  | Create SIP-010 tokens & SIP-009 NFTs in < 2 minutes.                                         |

---

### Tech Stack

*   **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui
*   **Blockchain**: Stacks.js (Connect, Transactions, Network)
*   **Smart Contracts**: Clarity (SIP-009, Marketplace)
*   **Data Indexing**: Hiro API (Balances, Activity, NFT Holdings)
*   **Backend**: Node.js + Socket.io (Real-time events)

---

### Project Structure

```bash
├── app/                  # Next.js App Router (Frontend)
│   ├── marketplace/      # NFT Marketplace Page
│   ├── profile/          # Dynamic User Profile Pages
│   └── ...
├── backend/              # Node.js Background Service
├── components/           # UI Components
│   ├── marketplace/      # Minting Logic & Grid
│   └── ...
├── contracts/            # Clarity Smart Contracts
├── lib/                  # Stacks & API Utilities
└── public/avatars/       # 100 Unique Avatar Assets
```

### Quick Start

#### 1. Frontend (Next.js)

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# App running at http://localhost:3000
```

#### 2. Backend (Real-time Service)

```bash
cd backend
npm install
npm run dev
# Server running at http://localhost:3001
```

#### 3. Smart Contracts

Contracts are located in `contracts/`.
*   `stacks-hub-avatars.clar`: The Avatar NFT contract.
*   Deployed Address (Testnet): `ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT`

---

### Smart Contract Details

**StacksHub Avatars (SIP-009)**
*   **Supply**: 100 Unique Items
*   **Mint Price**: 100 STX
*   **Features**: Linear minting, metadata URI support, owner mapping.

---

Made with ❤️ by StacksHub Team.