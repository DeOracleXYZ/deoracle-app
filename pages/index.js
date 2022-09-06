import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import { abi } from "../constants/abi";
import RequestCard from './components/RequestCard';

const injected = new InjectedConnector();

export default function Home() {
  const { activate, active, library: provider, account, chainId } = useWeb3React();

  useEffect(() => {
  }, [])

  async function connect() {
      try {
        await activate(injected);
      } catch(e) {
        console.log(e);
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
      {active ? (
        <>
          <div className='flex mt-5 mr-10 justify-end'>
            <div className='flex flex-col justify-center'>
              <p className="text-l font-bold">Connected account:</p>
              <p className="text-l">{account}</p>
            </div>
          </div>
          <div className='flex flex-col m-10 justify-center'>
            <p className="mt-3 text-2xl">{chainId}</p>
            <RequestCard color="red" handleClick={() => execute()}/>
          </div>
        </>
        ) : (
          <div className='flex mt-5 mr-10 justify-end'>
            <button className="px-4 py-1 text-sm text-blue-600 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"onClick={() => connect()}>Connect</button>
          </div>
        )}

    </div>
  
  )
}
