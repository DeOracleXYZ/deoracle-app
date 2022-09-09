import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import { VerificationResponse, VerificationState, WidgetProps } from '@worldcoin/id';
import dynamic from 'next/dynamic';
import RequestCard from '../components/RequestCard';
import ConnectHeader from '../components/ConnectHeader';


const injected = new InjectedConnector();

const WorldIDWidget = dynamic<WidgetProps>( 
  () => import("@worldcoin/id").then((mod) => mod.WorldIDWidget),
  { ssr: false }
);

export default function Home() {
  const { activate, active, active: networkActive, error: networkError, activate: activateNetwork, 
    library, library: provider, account, chainId } = useWeb3React();

  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState("");
  const [proof, setProof] = useState(null as VerificationResponse | null);


  const widgetProps: WidgetProps = {
    actionId: "wid_staging_51dfce389298ae2fea0c8d7e8f3d326e",
    signal: account,
    enableTelemetry: true,
    theme: "light",
    debug: true, // Recommended **only** for development
    onSuccess: (verificationResponse) => {setProof(verificationResponse)},
    onError: ({ code, detail }) => console.log({ code, detail }),
    onInitSuccess: () => console.log("Init successful"),
    onInitError: (error) => console.log("Error while initialization World ID", error),
  };



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
    const deOracleAddress = "0xD66404096dD3eAeF6251852741755796d6BEE5E5";
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
        <ConnectHeader data = {useWeb3React()}
                       balance = {balance}
                       handleClickConnect={()=> connect() } />

        <div className='flex flex-col m-10 justify-center'>
          <RequestCard color="red" handleClick={() => console.log("clicked!")}/> 
          <RequestCard color="blue" handleClick={() => console.log("clicked!")}/> 
          <RequestCard color="green" handleClick={() => console.log("clicked!")}/> 
          <div id="world-id-container"></div>
          <WorldIDWidget {...widgetProps}/>
        </div>

        <button onClick={()=> (console.log(proof), sendProof(proof))}>Log Data</button>

    </div>
  
  )
}
