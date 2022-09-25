# deOracle.xyz

**Decentralised P2P Oracle Platform & Cross-Chain Reputation for Digital Identities**


deOracle.xyz is a decentralised P2P oracle platform with a cross-chain reputation system for digital identities. Our goal is to bring reliable real-world data of any kind on-chain.

deOracle is useful for Smart Contract and dApp developers who are looking for wide scope data feeds not supported by mainstream oracles. Use cases: prediction markets, betting, lotteries, raffles, etc.

.

### 1. POST REQUESTS (WIDE SCOPE DATA)
Post request to oracles with description, bounty (USDC), min. required reputation (RP) and due date. Requester accepts a valid answer to release the bounty to said oracle's wallet address. Request and answer data is brought on-chain for use in smart contracts.

.

### 2. P2P ORACLE ANSWERS
Oracles browse through requests and post verified answers to earn bounties and build reputation. Community votes on the answers (via upvotes, downvotes) which affects the oracle's reputation.

.

### 3. CROSS-CHAIN REPUTATION
Verify your identity with Worldcoin and ENS on Polygon. Build up your reputation by posting valid answers. Hop chains to Optimism and your reputation points follow you. deOracle Reputation can be implemented by other on-chain protocols.

How it's Made

. 


## Tech

- deOracle smart contracts are deployed on Polygon Mumbai and Optimism Kovan. 
- The cross chain reputation system and cross chain data mirroring is done using Abacus/Hyperlane. 
- Users can verify their identity to earn their first reputation points using Worldcoin (PPPoPP) and ENS. 
- deOracle front-end is deployed on Filecoin/IPFS via Spheron. 
- Front-end tech stack: Next.js, Tailwind CSS, Ethers.js.


.

## Getting Started

Install dependencies, run only once:

```bash
yarn
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the dapp.