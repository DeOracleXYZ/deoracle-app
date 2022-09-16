module.exports = {
  deOracleABI: [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "InvalidNullifier",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "setENSVerified",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "setWorldIdVerified",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "requestText",
              type: "string",
            },
            {
              internalType: "address",
              name: "requestOrigin",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "bounty",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "reputation",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxAnswers",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "submittedAnswers",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "active",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "timeStampPosted",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "timeStampDue",
              type: "uint256",
            },
          ],
          internalType: "struct deOracle.Request",
          name: "_newRequest",
          type: "tuple",
        },
      ],
      name: "submitRequest",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "signal",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "root",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "nullifierHash",
          type: "uint256",
        },
        {
          internalType: "uint256[8]",
          name: "proof",
          type: "uint256[8]",
        },
      ],
      name: "verifyAndExecute",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "_address",
          type: "address",
        },
      ],
      name: "checkWorldIdVerified",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "ENSVerified",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "getRequestList",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "requestText",
              type: "string",
            },
            {
              internalType: "address",
              name: "requestOrigin",
              type: "address",
            },
            {
              internalType: "uint256",
              name: "bounty",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "reputation",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxAnswers",
              type: "uint256",
            },
            {
              internalType: "uint256[]",
              name: "submittedAnswers",
              type: "uint256[]",
            },
            {
              internalType: "bool",
              name: "active",
              type: "bool",
            },
            {
              internalType: "uint256",
              name: "timeStampPosted",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "timeStampDue",
              type: "uint256",
            },
          ],
          internalType: "struct deOracle.Request[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "requestList",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "requestText",
          type: "string",
        },
        {
          internalType: "address",
          name: "requestOrigin",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "bounty",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reputation",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "maxAnswers",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "active",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "timeStampPosted",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "timeStampDue",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      name: "worldIdVerified",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ],
};
