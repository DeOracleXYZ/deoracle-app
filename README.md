# deOracle.xyz

.

Decentralized P2P oracles to bring real-world data on-chain and build reputation with your on-chain identity.

.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Next.js Docs

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

.

**Tech / Sponsors:**
- Storage: IPFS & Filecoin (Spheron, NFT.storage)
- Blockchains: Polygon, Optimism, Aurora, Cronos, Oasis
- Auth / DID: Worldcoin (PPPoPP), ENS, Unstoppable Domains, Sismo, Spruce, 
- Notifications/Messaging: EPNS, XMTP
- Post Content: Lens
- Caching Blockchain Data: The Graph, Tableland
- Interoperability: Abacus

.

**Features:**
- Web 3 Login (Metamask/DID, Worldcoin)

- As a oracle inquirer:
  - Post a request
  - See results of other requests

- As an oracle:
  - See requests
  - Respond to requests

- Request details:
  - Free / Bounty
  - Set min. reputation of oracles
    - No. of oracles
    - Answer: yes / no
    - Disputed: yes / no
    - If yes (optional):
      - Requester creates a dispute with a stake
      - Other oracle with higher reputation provides answer
      - If dispute fails, requester loses stake
  - Set question string (expand types of requests)
  - Event date
  - Expiry date

- Reputation formula for oracle & requester:
  - No. of upvotes vs downvotes
  - Total number of votes
  - Account age
  - Activity vs balance ratio
  - No. of disputes

- Oracle profile & SBT (Soul Bound Token)
- Requester profile & SBT (Soul Bound Token)
