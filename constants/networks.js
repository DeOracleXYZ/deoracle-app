module.exports = {
    chainIdsMap: 
        {
            "80001": "MATIC",
            "420" : "OPTIMISM"

        },

    mumbai: 
       { 
            chainName: "Mumbai Testnet",
            chainId: "0x13881",
            rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
            nattiveCurrency: { name: "MATIC", decimals: 18, symbol: "MATIC" },
            blockExplorerUrls: ["https://explorer-mumbai.maticvigil.com"],
            iconUrls: ["https://gateway.ipfs.io/ipfs/QmQzDTTZTUQ1e2ABmbQAH9yGPswkxrWsVEg4idALHayE4U"]
        },

    goerli: 
        { 
             chainName: "Optimism Goerli",
             chainId: "0x1A4",
             rpcUrls: ["https://goerli.optimism.io"],
             nattiveCurrency: { name: "Optimism", decimals: 18, symbol: "OP" },
             blockExplorerUrls: ["https://blockscout.com/optimism/goerli"],
             iconUrls: ["https://gateway.ipfs.io/ipfs/QmXUcnrCet9a9UvYeQcbQQ1CE8uzi9n1UHNJjztHGWJmjn"]
         }
     
}