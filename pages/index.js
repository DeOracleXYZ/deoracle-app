import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";



import { abi } from "../constants/abi";
import RequestCard from './components/RequestCard';
import ConnectHeader from './components/ConnectHeader';

const injected = new InjectedConnector();



export default function Home() {
  const { activate, active, active: networkActive, error: networkError, activate: activateNetwork, 
    library, library: provider, account, chainId } = useWeb3React();
  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState();
  const [symbol, setSymbol] = useState();



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
      setSymbol(await provider._network.name)
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

  async function execute() {
    if (active) {
      const signer = provider.getSigner();
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, abi, signer)

      try {
        await contract.store(9);
      } catch(e) {
        console.log(e);
      }
    }

  }


  return (

    <div className="">
        <ConnectHeader active={active}
                       account={account}
                       balance={balance}
                       symbol={symbol}
                       library={library}
                       handleClickConnect={()=> connect() } />

        <div className='flex flex-col m-10 justify-center'>
          <RequestCard color="red" handleClick={() => execute()}/> 
          <RequestCard color="blue" handleClick={() => execute()}/> 
          <RequestCard color="green" handleClick={() => execute()}/> 
        </div>   

    </div>
  
  )
}
