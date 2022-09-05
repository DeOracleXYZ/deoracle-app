import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import { abi } from "../constants/abi";

const injected = new InjectedConnector();

export default function Home() {
  const { activate, active, library: provider, account } = useWeb3React();

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
    <div className={styles.container}>
      Hello Frogs!
      {active ? (
        <>
        Connected!
        <button className="px-4 py-1 text-sm text-red-600 font-semibold rounded-full border border-red-200 hover:text-white hover:bg-red-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"onClick={() => execute()}>Execute</button>
        <p className="mt-3 text-2xl">{account}</p>
        </>
        ) : (
          <button className="px-4 py-1 text-sm text-blue-600 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"onClick={() => connect()}>Connect</button>
        )}

    </div>
  )
}
