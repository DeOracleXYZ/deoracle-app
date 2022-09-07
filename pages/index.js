import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import dynamic from 'next/dynamic';
import RequestCard from './components/RequestCard';
import ConnectHeader from './components/ConnectHeader';

const injected = new InjectedConnector();

const WorldIDWidget = dynamic( 
  () => import("@worldcoin/id").then((mod) => mod.WorldIDWidget),
  { ssr: false }
);


export default function Home() {
  const { activate, active, active: networkActive, error: networkError, activate: activateNetwork, 
    library, library: provider, account, chainId } = useWeb3React();

  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState();

  useEffect(() => {
    injected
      .isAuthorized()
      .then((isAuthorized) => {
        setLoaded(true)
        if (isAuthorized && !networkActive && !networkError) {
          activateNetwork(injected)
        }
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [activateNetwork, networkActive, networkError])

  useEffect(() => {
    if(provider) {
    
    const fetchAccountData = async () => {
      const data = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(data));
    }
    fetchAccountData().catch(console.error);
  }
  }, [account, provider]);

  async function connect() { 
    try {
      await activate(injected)
    } catch(e) {
      console.log(e)
    }
  }

  async function sendProof(verificationResponse) {
    const {merkle_root, nullifier_hash, proof} = verificationResponse;
    const unpackedProof = ethers.utils.defaultAbiCoder.decode(["uint256[8]"], proof)[0];
    console.log(verificationResponse);
    console.log(unpackedProof)
    const deOracleAddress = "0x78db4E1f82ccE12B299805a0D50BAA91BE7bB21d";
    const deOracleABI = [
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
        "inputs": [],
        "name": "fetchRequests",
        "outputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "data",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "bounty",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "origin",
                "type": "address"
              }
            ],
            "internalType": "struct deOracle.Request[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "data",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "bounty",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "origin",
                "type": "address"
              }
            ],
            "internalType": "struct deOracle.Request",
            "name": "request",
            "type": "tuple"
          }
        ],
        "name": "postRequest",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "requestList",
        "outputs": [
          {
            "internalType": "string",
            "name": "data",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "bounty",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "origin",
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
      }
    ]
    const signer = await provider.getSigner();
    const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, signer);

    deOracleContract.verifyAndExecute(account, merkle_root, nullifier_hash, unpackedProof, {gasLimit: 10000000})
  }


  return (

    <div className="">
        <div className='my-5 mr-5 align-middle justify-self-center'>
          
        </div>
        <ConnectHeader active={active}
                       account={account}
                       balance={balance}
                       chainId={chainId}
                       library={library}
                       handleClickConnect={()=> connect() } />

        <div className='flex flex-col m-10 justify-center'>
          <RequestCard color="red" handleClick={() => console.log("clicked!")}/> 
          <RequestCard color="blue" handleClick={() => console.log("clicked!")}/> 
          <RequestCard color="green" handleClick={() => console.log("clicked!")}/> 

          <WorldIDWidget
              actionId="wid_staging_51dfce389298ae2fea0c8d7e8f3d326e" // obtain this from developer.worldcoin.org
              signal={account}
              enableTelemetry
              onSuccess={(verificationResponse) => sendProof(verificationResponse)} // you'll actually want to pass the proof to the API or your smart contract
              onError={(error) => console.error(error)} />

        </div>   

    </div>
  
  )
}
