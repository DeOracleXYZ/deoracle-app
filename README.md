# deOracle.xyz

deOracle.xyz is a decentralised P2P oracle platform with a cross-chain reputation system for digital identities. Our goal is to bring reliable real-world data of any kind on-chain.

deOracle is useful for Smart Contract and dApp developers who are looking for wide scope data feeds not supported by mainstream oracles. Use cases: prediction markets, betting, lotteries, raffles, etc.


### 1. Post Requests (wide scope data)

Post request to oracles with description, bounty (USDC), min. required reputation (RP) and due date. Requester accepts a valid answer to release the bounty to said oracle's wallet address. Request and answer data is brought on-chain for use in smart contracts.


#### 2. P2P Oracle Answers

Oracles browse through requests and post verified answers to earn bounties and build reputation. Community votes on the answers (via upvotes, downvotes) which affects the oracle's reputation.


### 3. Cross-Chain Reputation

Verify your identity with Worldcoin and ENS on Polygon. Build up your reputation by posting valid answers. Hop chains to Optimism and your reputation points follow you. deOracle Reputation can be implemented by other on-chain protocols.

---------


## Future Considerations

Current implementation is openended, future implementations will include type formated answers (i.e. number, boolean, multiple choice, dates).

Use cases include prediction markets, insurance arbitration, legal mediation, on-chain disputes, DAO voting / governance, blockchain trivia and play to earn.

Your on-chain identity and deOracle REP is accesible across multiple blockchains. Secured and transmited by Hyperlane (Abacus).

---------

## Tech

- **Digital Identity:** Worldcoin (PPPoPP), ENS
- **Blockchains:** Polygon, Optimism
- **Storage:** IPFS, Filecoin, Spheron
- **Cross-chain:** Abacus / Hyperlane
- **Front-end:** Next.js, Tailwind CSS, Ethers.js

---------

## Features:

- Connect wallet with Metamask on Mumbai or Goerli
- Verify identity with Worldcoin ID, ENS and Lens Profile
- Post request with bounty in USDC for oracles to answer
- Oracles answer the requests to earn bounties and reputation
- Community votes on oracle answers (upvotes, downvotes)

---------

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
