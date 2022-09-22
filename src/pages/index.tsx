import { useEffect, useState, useId } from "react";
import { Contract, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { VerificationResponse, WidgetProps } from "@worldcoin/id";
import dynamic from "next/dynamic";
import ConnectHeader from "../components/ConnectHeader";
import { deOracleABI, erc20ABI } from "../constants/abis";
import Head from "next/head";
import RequestCreate from "../components/RequestCreate";
import RequestCard from "../components/RequestCard";

const injected = new InjectedConnector({
  supportedChainIds: [0x13881, 0x7a69, 69],
});

const WorldIDWidget = dynamic<WidgetProps>(
  () => import("@worldcoin/id").then((mod) => mod.WorldIDWidget),
  { ssr: false }
);

export default function Home() {
  const {
    activate,
    active: networkActive,
    error: networkError,
    activate: activateNetwork,
    library,
    library: active,
    library: provider,
    account,
    chainId
  } = useWeb3React();

  const mumbaiProvider = new ethers.providers.AlchemyProvider(
    0x13881,
    "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY"
  );

  const id = useId();
  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState("");
  const [proofResponse, setProofResponse] = useState(null as VerificationResponse | null);
  const [chain, setChain] = useState();
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [ENSVerified, setENSVerified] = useState(false);
  const [ENSName, setENSName] = useState("");
  const [deOracleAddress, setDeOracleAddress] = useState();
  const [deOracleREAD, setDeOracleREAD] = useState(null as Contract | null);
  const [deOracleWRITE, setDeOracleWRITE] = useState(null as Contract | null);
  const [requestList, setRequestList] = useState([] as any[]);
  const [answerList, setAnswerList] = useState([] as any[]);
  const [verificationCount, setVerficationCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [sendAnswerState, setSendAnswerState] = useState(false);
  const [earnedBountyCount, setEarnedBountyCount] = useState("");
  const [REP, setREP] = useState(0);
  const [answerFormData, setAnswerFormData] = useState({
    answerText: "",
    requestId: -1,
  });

  const copyrightYear = eval(/\d{4}/.exec(Date())![0]);

  const widgetProps: WidgetProps = {
    actionId: "wid_staging_51dfce389298ae2fea0c8d7e8f3d326e",
    signal: account ? account : "",
    enableTelemetry: true,
    theme: "light",
    debug: true, // Recommended **only** for development
    onSuccess: (verificationResponse) => {
      setProofResponse(verificationResponse);

    },
    onError: ({ code, detail }) => console.log({ code, detail }),
    onInitSuccess: () => console.log("Init successful"),
    onInitError: (error) =>
      console.log("Error while initialization World ID", error),
  };
  useEffect(() => {
    if(deOracleAddress){

    if(typeof(chainId) === "undefined") {
      setDeOracleREAD(
        new ethers.Contract(
        deOracleAddress,
        deOracleABI,
        mumbaiProvider
      ))
    } else {
          console.log(chainId, deOracleAddress),
          setDeOracleREAD(
            new ethers.Contract(
            deOracleAddress,
            deOracleABI,
            provider
          )),
          setDeOracleWRITE(
            new ethers.Contract(
            deOracleAddress,
            deOracleABI,
            provider.getSigner()
          ))
  }
        
}
    
  }, [deOracleAddress, chainId])

  //check if injected and active.  If not, use Alchemy RPC provider(mumbai)
  useEffect(() => {
    if(chainId || deOracleREAD) {
    if(typeof(chainId) === "undefined") {
      setDeOracleAddress("0xBE206E63D5cD933D165183C9C834a45BE6e176ea");      
    } else {
      try{
        if (chainId === 69) {
            setDeOracleAddress("0x7ecf20A28b2DFf9CaE85c060e9632ae5aF877209");           
        } else if (chainId === 80001) {
            setDeOracleAddress("0xBE206E63D5cD933D165183C9C834a45BE6e176ea");
        }
      } catch(err) {
        console.log(err)
      }
    }
    } else {
      setDeOracleAddress("0xBE206E63D5cD933D165183C9C834a45BE6e176ea")
    }
  }, [chainId])

  useEffect(() => {
  
      const readContractData = async () => {
        setRequestList(await deOracleREAD!.getRequestList());
        setAnswerList(await deOracleREAD!.getAnswerList());
    }

    deOracleREAD &&
     readContractData();
  

      const writeContractData = async () => {
          setREP(await (await deOracleWRITE!.getREP()).toNumber());
          setWorldIdVerified(await deOracleWRITE!.addressToWorldIdVerified(account));
          setENSVerified(await deOracleWRITE!.addressToENSVerified(account));
          const data = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(data));
      };
      const updateVerifiedCount = () => {
        let verifCount = 0;
        worldIdVerified && verifCount++;
        ENSVerified && verifCount++;
        setVerficationCount(verifCount);
      };

      deOracleWRITE && (
        writeContractData(),
        updateVerifiedCount()
      )

  }, [deOracleREAD]);

  useEffect(() => {
    const updateRequestsCount = () => {
      if (requestList) {
        let requestCount = 0;
        for (let i=0; i<Object.keys(requestList!).length; i++) {
          (requestList[i].origin === account) && requestCount++;
        }
        setRequestsCount(requestCount)
      }
    };

    const updateAnswersCount = () => {
      if (answerList) {
        let answerCount = 0;
        for (let i=0; i<Object.keys(answerList!).length; i++) {
          (answerList[i].origin === account) && answerCount++;
        }

        setAnswersCount(answerCount)
      }
    };

    const updateEarnedBountyCount = async () => {
      deOracleWRITE &&
        setEarnedBountyCount( parseInt(ethers.utils.formatUnits((await deOracleWRITE.getBountyEarned()), 18)).toFixed(2) )
    };

    updateRequestsCount();
    updateAnswersCount();
    updateEarnedBountyCount();
  }, [deOracleREAD, requestsCount, answersCount, earnedBountyCount]);

  useEffect(() => {
    proofResponse && sendProof();
    async function sendProof() {
      let { merkle_root, nullifier_hash, proof }  = proofResponse!; 
      let unpackedProof = ethers.utils.defaultAbiCoder.decode(
        ["uint256[8]"],
        proof
      )[0];
      deOracleWRITE &&
      deOracleWRITE.verifyAndExecute(
        account,
        merkle_root,
        nullifier_hash,
        unpackedProof,
        { gasLimit: 10000000 }
      );
    }
  }, [proofResponse, deOracleWRITE, account])

  //ENSVerification
  useEffect(() => {
    const mainNetProvider = new ethers.providers.AlchemyProvider(
      1,
      "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY"
    );

    const resolveAddress = async () => {
      if (account) {
        try {
          const ENS = await mainNetProvider.lookupAddress(account);
          ENS && setENSName(ENS);

        } catch (err) {
          console.log(err);
        }
      }
    };
    resolveAddress();
  }, [ENSName, ENSVerified, account]);


  useEffect(() => {
    injected
      .isAuthorized()
      .then((isAuthorized) => {
        setLoaded(true);
        if (isAuthorized && !networkActive && !networkError) {
          activateNetwork(injected);
        }
      })
      .catch(() => {
        setLoaded(true);
      });
  }, [activateNetwork, networkActive, networkError]);


  async function connect() {
    //TODO: 
    try {
      await activate(injected)
    } catch (e) {
      console.log(e);
    }
  }

  const switchNetwork = async (chain: any) => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.chainId }],
      });
    } catch (switchError: any) {
      console.log(switchError)
      // 4902 error code indicates the chain is missing on the wallet
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chain.chainId,
                rpcUrls: chain.rpcUrls,
                chainName: chain.chainName,
                nativeCurrency: chain.nativeCurrency,
                blockExplorerUrls: chain.blockExplorerUrls,
                iconUrls: chain.iconUrls,
              },
            ],
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  
  async function verifyENS() {
    let txReceipt;
    if(deOracleWRITE)
      try {
        txReceipt = await deOracleWRITE.setENSVerified(ENSName);
        //ENS Status loading spinner? 
        txReceipt = await txReceipt.wait();

        if(txReceipt.status === 1){
          setENSVerified(true);
        } else {
          console.log("Transaction failed, ENS not verified.")
        }
      } catch (err) {
        console.log(err);
      }
  }
  

  //worldID addr 0xD81dE4BCEf43840a2883e5730d014630eA6b7c4A

  const requestCardList = () => {

    const keysDesc: any = Object.keys(requestList!).sort((a:any, b:any) => {return b-a})
    const requestListDesc: any = [];

    for (let i=0; i<keysDesc.length; i++) {
      const obj = requestList![keysDesc[i]];
      requestListDesc.push(obj);
    }

    const requestEls = requestListDesc.map((card: any) => {
      let i = requestListDesc.indexOf(card);
      return (
        <RequestCard
          key={id + i}
          requestData={card}
          // handleClickAnswer={() => sendAnswer(answerFormData)}
          answerFormData={answerFormData}
          updateAnswerFormData={setAnswerFormData}
          answerList={answerList}
          setSendAnswerState={setSendAnswerState}
          provider={provider}
          deOracleWRITE={deOracleWRITE}
          deOracleREAD={deOracleREAD}
          account={account}
        />
      );
    });
    return requestEls;
  };

  return (
    <>
      <Head>
        <title>deOracle.xyz</title>
      </Head>

      <ConnectHeader
        data={useWeb3React()}
        balance={balance}
        worldIdVerified={worldIdVerified}
        WorldIDWidget={<WorldIDWidget {...widgetProps} />}
        verifyENS={() => verifyENS()}
        ENSVerified={ENSVerified}
        ENSName={ENSName}
        REP={REP}
        requestsCount={requestsCount}
        answersCount={answersCount} 
        earnedBountyCount={earnedBountyCount}
        verificationCount={verificationCount}
        chain={chain}
        setChain={setChain}
        handleSwitchNetwork={() => switchNetwork(chain)}
       
        handleClickConnect={() => connect()}
      />

      <div className="flex flex-col my-6 mx-3 md:m-10 justify-center">
        <RequestCreate
          account={account}
          deOracleWRITE={deOracleWRITE}
          provider={provider}
          deOracleAddress={deOracleAddress}
        />

        <div>{requestList && requestCardList()}</div>
      </div>

      <footer className="container text-center py-10 px-10 mt-10">
        <hr />
        <br />
        <br />
        <p className="mb-1 pt-2 text-slate-400">
          &copy; {copyrightYear} deOracle.xyz. <i>
            Made by{" "}
            <a
              href="https://twitter.com/0xMarkeljan"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 underline hover:no-underline hover:text-slate-500"
            >
              @Mark
            </a>{" "}
            and{" "}
            <a
              href="https://twitter.com/alex_biet"
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 underline hover:no-underline hover:text-slate-500"
            >
              @Alex
            </a>
          </i>
        </p>

        <br />
        <br />

        <p>
          <a className="text-slate-600 underline hover:no-underline hover:text-slate-500"
             href="https://calibration-faucet.filswan.com/#/dashboard" 
             target="_blank" 
             rel="noreferrer">Faucet USDC</a> &nbsp; | &nbsp; <a href="#" className="text-slate-600 underline hover:no-underline hover:text-slate-500">Back to Top</a>
        </p>
        <br />
      </footer>
    </>
  );
}
