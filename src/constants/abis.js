module.exports = {
    deOracleABI: [
      {
        "inputs": [
          {
            "internalType": "contract IWorldID",
            "name": "_worldId",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "InvalidNullifier",
        "type": "error"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "string",
            "name": "walletAddress",
            "type": "string"
          }
        ],
        "name": "logId",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "signal",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "root",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "nullifierHash",
            "type": "uint256"
          },
          {
            "internalType": "uint256[8]",
            "name": "proof",
            "type": "uint256[8]"
          }
        ],
        "name": "verifyAndExecute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          }
        ],
        "name": "checkVerified",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "worldIdVerified",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ]
}