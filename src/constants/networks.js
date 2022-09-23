module.exports = {
  chainIdsMap: {
    80001: "MATIC",
    420: "OP",
    69: "ETH"
  },

  mumbai: {
    chainName: "Mumbai Testnet",
    chainId: "0x13881",
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    nattiveCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
    blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
    iconUrls: [
      "https://gateway.ipfs.io/ipfs/QmQzDTTZTUQ1e2ABmbQAH9yGPswkxrWsVEg4idALHayE4U",
    ],
  },
  kovan: {
    chainName: "Optimism Kovan",
    chainId: "0x45",
    rpcUrls: ["https://kovan.optimism.io"],
    nattiveCurrency: { name: "ETHER", decimals: 18, symbol: "ETH" },
    blockExplorerUrls: ["https://kovan-optimistic.etherscan.io"],
    iconUrls: [
      "https://assets-global.website-files.com/5f973c970bea5548ad4287ef/61a7eb59d69e3f7e399a852a_optimistic.png",
    ],
  },

  goerli: {
    chainName: "Optimism Goerli",
    chainId: "0x1A4",
    rpcUrls: ["https://goerli.optimism.io"],
    nattiveCurrency: { name: "Optimism", decimals: 18, symbol: "OP" },
    blockExplorerUrls: ["https://blockscout.com/optimism/goerli"],
    iconUrls: [
      "https://gateway.ipfs.io/ipfs/QmXUcnrCet9a9UvYeQcbQQ1CE8uzi9n1UHNJjztHGWJmjn",
    ],
  },
};
