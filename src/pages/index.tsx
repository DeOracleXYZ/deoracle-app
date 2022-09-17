import { useEffect, useState, useId } from "react";
import { Contract, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { VerificationResponse, WidgetProps } from "@worldcoin/id";
import dynamic from "next/dynamic";
import ConnectHeader from "../components/ConnectHeader";
// import RequestContainer from "../components/RequestContainer";
import { deOracleABI } from "../constants/abis";
import Head from "next/head";
import RequestCreate from "../components/RequestCreate";
import RequestCard from "../components/RequestCard";

const injected = new InjectedConnector({
  supportedChainIds: [0x13881, 0x7a69],
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
    library: provider,
    account,
    chainId,
  } = useWeb3React();

  const id = useId();
  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState("");
  const [proofResponse, setProofResponse] = useState(null as VerificationResponse | null);
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [ENSVerified, setENSVerified] = useState(false);
  const [ENSName, setENSName] = useState("");
  const deOracleAddress = "0xbb385025B17F539d2d46Fbb90a4548424718AD26";
  const [deOracleREAD, setDeOracleREAD] = useState(null as Contract | null);
  const [deOracleWRITE, setDeOracleWRITE] = useState(null as Contract | null);
  const [requestList, setRequestList] = useState();
  const [answerList, setAnswerList] = useState();
  const [verificationCount, setVerficationCount] = useState(0);
  const [REP, setREP] = useState(0);
  const [answerFormData, setAnswerFormData] = useState({
    answerText: "",
    requestId: -1,
  });
  const [formData, setFormData] = useState({
    requestText: "",
    bounty: 0,
    reputation: 0,
    dueDate: "",
    dueDateUnix: "",
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
    if(provider)
    try{
      setDeOracleREAD(
        new ethers.Contract(
        deOracleAddress,
        deOracleABI,
        provider
      ))
      setDeOracleWRITE(
        new ethers.Contract(
        deOracleAddress,
        deOracleABI,
        provider.getSigner()
      ))
    } catch(err) {
      console.log(err)
    }
    
  }, [provider])


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

  useEffect(() => {
    if (provider) {

      const readContractData = async () => {
        deOracleWRITE && (
          setREP((await deOracleWRITE.getREP()).toNumber()),
          setRequestList(await deOracleWRITE.getRequestList()),
          setAnswerList(await deOracleWRITE.getAnswerList())
        )
        
      };
      const checkVerified = async () => {
        deOracleWRITE && (
        setWorldIdVerified(
          await deOracleREAD!.checkWorldIdVerified(account)
        )
        )
      };

      const updateVerifiedCount = () => {
        let verifCount = 0;
        worldIdVerified && verifCount++;
        ENSVerified && verifCount++;
        setVerficationCount(verifCount);
      };

      const fetchbalanceAndREP = async () => {
        const data = await provider.getBalance(account);
        setBalance(ethers.utils.formatEther(data));
      };

      readContractData();
      checkVerified();
      fetchbalanceAndREP();
      updateVerifiedCount();
    } else {
      ///default RPC provider
      const mumbaiProvider = new ethers.providers.AlchemyProvider(
        0x13881,
        "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY"
      );
      const getRequestsRPC = async () => {
        const deOracleContract = new ethers.Contract(
          deOracleAddress,
          deOracleABI,
          mumbaiProvider
        );

      setRequestList(await deOracleContract.getRequestList());
      };

      getRequestsRPC().catch(console.error);
    }
  }, [ENSVerified, account, provider, worldIdVerified]);

  useEffect(() => {
    proofResponse && sendProof();
    async function sendProof() {
      const { merkle_root, nullifier_hash, proof }  = proofResponse!; 
      const unpackedProof = ethers.utils.defaultAbiCoder.decode(
        ["uint256[8]"],
        proof
      )[0];
  
      deOracleWRITE!.verifyAndExecute(
        account,
        merkle_root,
        nullifier_hash,
        unpackedProof,
        { gasLimit: 10000000 }
      );
    }
  }, [proofResponse])

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
          ENS && setENSVerified(true);

        } catch (err) {
          console.log(err);
        }
      }
    };
    resolveAddress();
  }, [ENSName, ENSVerified, account]);

  async function connect() {
    try {
      await activate(injected);
    } catch (e) {
      console.log(e);
    }
  }

  // async function verifyENS() {
  //   if (ENSVerified)
  //     try {
  //       const deOracleContract = new ethers.Contract(
  //         deOracleAddress,
  //         deOracleABI,
  //         provider.getSigner()
  //       );
  //       deOracleContract.setENSVerified(account);
  //     } catch (err) {
  //       console.log(err);
  //     }
  // }

  //worldcoin proof addr 0xD81dE4BCEf43840a2883e5730d014630eA6b7c4A

  // const deOracleAddress = "0x13879b673b8787b031c263520A92d630b73F8C2F";
  //hardhat TEMP:


  async function sendRequest(request: any) {
    const { requestText, bounty, reputation, dueDateUnix } = request;

    deOracleWRITE!.submitRequest(
      requestText,
      bounty,
      reputation,
      dueDateUnix
    );
  }

  async function sendAnswer(answerData: any) {
    // console.log(answerData, "inside functionnn");
    const { requestId, answerText } = answerData;

    deOracleWRITE!.postAnswer(requestId, answerText);
  }

  const requestCardList = () => {

    const keysDesc = Object.keys(requestList!).sort((a:any, b:any) => {return b-a})
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
          handleClick={() => console.log("clicked!")}
          handleClickAnswer={() => sendAnswer(answerFormData)}
          answerFormData={answerFormData}
          updateAnswerFormData={setAnswerFormData}
          answerList={answerList}
          // getAnswerCount={() => getAnswerCount(id.toNumber())}
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
        ENSVerified={ENSVerified}
        REP={REP}
        verificationCount={verificationCount}
        handleClickConnect={() => connect()}
      />

      <div className="flex flex-col my-6 mx-3 md:m-10 justify-center">
        <RequestCreate
          account={account}
          handleClick={() => {
            sendRequest(formData);
          }}
          formData={formData}
          updateFormData={setFormData}
        />

        <div>{requestList && requestCardList()}</div>
      </div>

      <footer className="container text-center py-10 px-10 mt-10">
        <hr />
        <br />
        <br />
        <p className="mb-1 pt-2 text-slate-400">
          &copy; {copyrightYear} deOracle.xyz
        </p>
        <p className="text-slate-400">
          <i>
            Made by{" "}
            <a
              href="https://twitter.com/0xMarkeljan"
              target="_blank"
              rel="noreferrer"
            >
              <u>@Mark</u>
            </a>{" "}
            and{" "}
            <a
              href="https://twitter.com/alex_biet"
              target="_blank"
              rel="noreferrer"
            >
              <u>@Alex</u>
            </a>
          </i>
        </p>

        <br />
        <br />

        <p className="text-slate-400">
          <a href="#">Back to top</a>
        </p>
      </footer>
    </>
  );
}
