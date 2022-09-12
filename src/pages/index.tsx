import { useEffect, useState, useId } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import { VerificationResponse, VerificationState, WidgetProps } from '@worldcoin/id';
import dynamic from 'next/dynamic';
import ConnectHeader from '../components/ConnectHeader';
import RequestContainer from '../components/RequestContainer';
import { deOracleABI } from '../constants/abis'
import Head from 'next/head'


const injected = new InjectedConnector({supportedChainIds: [0x13881]});

const WorldIDWidget = dynamic<WidgetProps>( 
  () => import("@worldcoin/id").then((mod) => mod.WorldIDWidget),
  { ssr: false }
);

export default function Home() {
  const { activate, active: networkActive, error: networkError, activate: activateNetwork, 
     library, library: provider, account, chainId } = useWeb3React();
 
  const mainNetProvider = new ethers.providers.AlchemyProvider(1, "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY");  
  const id = useId();
  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState("");
  const [proof, setProof] = useState(null as VerificationResponse | null);
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [ENSVerified, setENSVerified] = useState(false);
  const [requestList, setRequestList] = useState();

  const copyrightYear = eval(/\d{4}/.exec(Date())![0]);
  
  const widgetProps: WidgetProps = {
    actionId: "wid_staging_51dfce389298ae2fea0c8d7e8f3d326e",
    signal: account ? account : "",
    enableTelemetry: true,
    theme: "light",
    debug: true, // Recommended **only** for development
    onSuccess: (verificationResponse) => {setProof(verificationResponse)},
    onError: ({ code, detail }) => console.log({ code, detail }),
    onInitSuccess: () => console.log("Init successful"),
    onInitError: (error) => console.log("Error while initialization World ID", error),
  };


  useEffect(() => {

    injected.isAuthorized().then((isAuthorized) => {
        setLoaded(true)
        if (isAuthorized && !networkActive && !networkError) {
          activateNetwork(injected)
        }
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [activateNetwork, networkActive, networkError])


  //fetch accountData
  useEffect(() => {
    if(account) {
      
      const getRequests = async () => {
        const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider);
        setRequestList(await deOracleContract.getRequestList());
        
      }
      const checkVerified = async (_account:string) => {
        const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider);
        setWorldIdVerified(await deOracleContract.checkVerified(_account));
      }
  
      const fetchbalance = async () => {
        const data = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(data));
     
    }
    
    getRequests().catch(console.error);
    checkVerified(account).catch(console.error);
    fetchbalance().catch(console.error);
  } else {
    ///default RPC provider
    const mumbaiProvider = new ethers.providers.AlchemyProvider(0x13881, "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY")
    const getRequestsRPC = async () => {
      const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, mumbaiProvider);
      setRequestList(await deOracleContract.getRequestList());
      
    }
   
      getRequestsRPC().catch(console.error);
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


  async function sendProof(verificationResponse: any) {
    const {merkle_root, nullifier_hash, proof} = verificationResponse;
    const unpackedProof = ethers.utils.defaultAbiCoder.decode(["uint256[8]"], proof)[0];
    console.log(verificationResponse);
    console.log(unpackedProof)
    const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider.getSigner());
  
    deOracleContract.verifyAndExecute(account, merkle_root, nullifier_hash, unpackedProof, {gasLimit: 10000000})
  }

  async function sendRequest() {
    const request = ["Who is your daddy?", account, 100, 20, 2, [], false,  1662793030, 1667783030];
    const deOracleContract = new ethers.Contract(deOracleAddress, deOracleABI, provider.getSigner());
  
    deOracleContract.submitRequest(request);
  }


  return (

    <>
      <Head>
        <title>deOracle.xyz</title>
      </Head>

      <ConnectHeader data = {useWeb3React()}
                      balance = {balance}
                      worldIdVerified = {worldIdVerified}
                      WorldIDWidget = {<WorldIDWidget {...widgetProps}/>}
                      ENSVerified = {ENSVerified}
                      handleClickConnect={()=> connect() } />

      <div className='flex flex-col m-10 justify-center'>

      <RequestContainer id = {id} 
                        account = {account}
                        requestList = {requestList} />
 
      </div>

      <div className="flex flex-col-3 gap-4 justify-center">
        <button className="border px-4 py-2 bg-purple-200 border-purple-400" onClick={()=> (sendProof(proof))}>SendProof</button>
        <button className="border px-4 py-2 bg-purple-200 border-purple-400" onClick={()=> console.log(requestList)}>PrintList</button>
        <button className="border px-4 py-2 bg-purple-200 border-purple-400" onClick={()=> sendRequest()}>SendRequest</button>
      </div>

      <footer className="container text-center py-10 px-10 mt-10">
        <hr />
        <br />
        <br />
        <p className="mb-1 pt-2 text-slate-400">&copy; {copyrightYear} deOracle.xyz</p>
        <p className="text-slate-400"><i>Made by <a href="https://twitter.com/0xMarkeljan" target="_blank" rel="noreferrer"><u>@Mark</u></a> and <a href="https://twitter.com/alex_biet" target="_blank" rel="noreferrer"><u>@Alex</u></a></i></p>

        <br />
        <br />

        <p className="text-slate-400">
          <a href="#">Back to top</a>
        </p>
      </footer>

    </>
  
  )
}
