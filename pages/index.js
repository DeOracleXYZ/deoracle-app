import styles from '../styles/Home.module.css'
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector  } from "@web3-react/injected-connector";
import { abi } from "../constants/abi";

const injected = new InjectedConnector();

export default function Home() {
  console.log(useWeb3React)
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
        <button onClick={() => execute()}>Execute</button>
        <p>{account}</p>
        </>
        ) : (
          <button onClick={() => connect()}>Connect</button>
        )}

    </div>
  )
}
