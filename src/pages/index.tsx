import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import { VerificationResponse, VerificationState, WidgetProps } from '@worldcoin/id';
import dynamic from 'next/dynamic';
import RequestCard from '../components/RequestCard';
import ConnectHeader from '../components/ConnectHeader';
import RequestContainer from '../components/requestContainer';
import { deOracleABI } from '../constants/abis'


const injected = new InjectedConnector();

const WorldIDWidget = dynamic<WidgetProps>( 
  () => import("@worldcoin/id").then((mod) => mod.WorldIDWidget),
  { ssr: false }
);

export default function Home() {
  const { activate, active, active: networkActive, error: networkError, activate: activateNetwork, 
    library, library: provider, account, chainId } = useWeb3React();

  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState(0);
  const [proof, setProof] = useState(null as VerificationResponse | null);
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [ENSVerified, setENSVerified] = useState(false);
  const [requestList, setRequestList] = useState();
  

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

      const checkVerified = async (_account:string) => {
        const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider);
        setWorldIdVerified(await deOracleContract.checkVerified(_account));
      }
      const getRequests = async () => {
        const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider);
        setRequestList(await deOracleContract.getRequestList());
      }
    
      const fetchbalance = async () => {
        const data = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(data));
     
    }

    getRequests().catch(console.error);
    checkVerified(account).catch(console.error);
    fetchbalance().catch(console.error);
  }
  }, [account, provider]);

  async function connect() { 
    try {
      await activate(injected)
    } catch(e) {
      console.log(e)
    }
  }

  const deOracleAddress = "0x6E066eE27B0338abF2Ed9837Efe8C6e8385A021a";


  async function sendProof(verificationResponse) {
    const {merkle_root, nullifier_hash, proof} = verificationResponse;
    const unpackedProof = ethers.utils.defaultAbiCoder.decode(["uint256[8]"], proof)[0];
    console.log(verificationResponse);
    console.log(unpackedProof)
    const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider.getSigner());
  
    deOracleContract.verifyAndExecute(account, merkle_root, nullifier_hash, unpackedProof, {gasLimit: 10000000})
  }





  return (

    <div className="">
        <div className='my-5 mr-5 align-middle justify-self-center'>
          
        </div>
        <ConnectHeader data = {useWeb3React()}
                       balance = {balance}
                       worldIdVerified = {worldIdVerified}
                       ENSVerified = {ENSVerified}
                       handleClickConnect={()=> connect() } />

        <div className='flex flex-col m-10 justify-center'>

          <RequestContainer id = "9009" 
                            account = {account}
                            requestList = {requestList} />


          <br></br>
          <br></br>
          <hr></hr>
          <br></br>
          <br></br>
          <div id="world-id-container"></div>
          {!worldIdVerified && <WorldIDWidget {...widgetProps}/>}
          
        </div>

        <div className="flex flex-col gap-2">
          <button className="border" onClick={()=> (sendProof(proof))}>SendProof</button>
          <button className="border" onClick={()=> console.log(requestList)}>PrintList</button>
        </div>

    </div>
  
  )
}
