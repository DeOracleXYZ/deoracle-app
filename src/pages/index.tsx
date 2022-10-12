import { useEffect, useState, useId } from "react";
import { Contract, ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import { VerificationResponse, WidgetProps } from "@worldcoin/id";
import dynamic from "next/dynamic";
import ConnectHeader from "../components/ConnectHeader";
import { deOracleABI, usdcABI } from "../constants/abis";
import Head from "next/head";
import RequestCreate from "../components/RequestCreate";
import RequestCard from "../components/RequestCard";
import { mumbai, kovan } from "../constants/networks";
import Notification from "../components/Notification";

declare global {
  interface Window {
    ethereum: any;
  }
}

const supportedChainIds = [0x13881];
const injected = new InjectedConnector({
  supportedChainIds: supportedChainIds,
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
    account,
    chainId,
  } = useWeb3React();
  let { library, library: active, library: provider } = useWeb3React();

  const id = useId();
  const [loaded, setLoaded] = useState(false);
  const [balance, setBalance] = useState("");
  const [proofResponse, setProofResponse] = useState(
    null as VerificationResponse | null
  );
  const [worldIdVerified, setWorldIdVerified] = useState(false);
  const [ENSVerified, setENSVerified] = useState(false);
  const [ENSName, setENSName] = useState("");
  const mumbaiAddress = "0xf73dA1dDFf414de60ee043F18ED5D68B062d7203"; // LIVE
  const mumbaiProvider = new ethers.providers.AlchemyProvider(
    0x13881,
    "vd1ojdJ9UmyBbiKOxpWVnGhDpoFVVxBY"
  );
  const [deOracleAddress, setDeOracleAddress] = useState(mumbaiAddress);
  const [deOracleREAD, setDeOracleREAD] = useState(
    new ethers.Contract(
      mumbaiAddress,
      deOracleABI,
      mumbaiProvider
    ) as Contract | null
  );
  const [deOracleWRITE, setDeOracleWRITE] = useState(null as Contract | null);
  const [requestList, setRequestList] = useState([] as any[]);
  const [answerList, setAnswerList] = useState([] as any[]);
  const [verificationCount, setVerficationCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [answersCount, setAnswersCount] = useState(0);
  const [sendAnswerState, setSendAnswerState] = useState(false);
  const [earnedBountyCount, setEarnedBountyCount] = useState("");
  const [REP, setREP] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [answerFormData, setAnswerFormData] = useState({
    answerText: "",
    requestId: -1,
  });
  const [notificationError, setNotificationError] = useState();
  const [notificationMessage, setNotificationMessage] = useState();
  const [displayNotification, setDisplayNotification] = useState();

  const copyrightYear = eval(/\d{4}/.exec(Date())![0]);

  const widgetProps: WidgetProps = {
    actionId: "wid_staging_51dfce389298ae2fea0c8d7e8f3d326e",
    signal: account ? account : "",
    enableTelemetry: true,
    theme: darkMode ? "dark" : "light",
    debug: true, // Recommended **only** for development
    onSuccess: (verificationResponse) => {
      switchNetwork(mumbai);
      setProofResponse(verificationResponse);
    },
    onError: ({ code, detail }) => console.log({ code, detail }),
    onInitSuccess: () => console.log("Init successful"),
    onInitError: (error) =>
      console.log("Error while initialization World ID", error),
  };

  useEffect(() => {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
  });
  useEffect(() => {
    if (sendAnswerState) {
      window.location.reload();
    }
  }, [sendAnswerState]);

  useEffect(() => {
    //if connected or RPCprovider
    if (!networkActive) {
      setDeOracleAddress(mumbaiAddress);
      setDeOracleREAD(
        new ethers.Contract(mumbaiAddress, deOracleABI, mumbaiProvider)
      );
    }
    //if Mumbai
    if (chainId === 80001) {
      setDeOracleAddress(mumbaiAddress);
      setDeOracleREAD(
        new ethers.Contract(mumbaiAddress, deOracleABI, provider)
      );
      setDeOracleWRITE(
        new ethers.Contract(mumbaiAddress, deOracleABI, provider.getSigner())
      );
    }
  }, [chainId, networkActive]);

  useEffect(() => {
    const readContractData = async () => {
      setRequestList(await deOracleREAD!.getRequestList());
      setAnswerList(await deOracleREAD!.getAnswerList());
    };
    deOracleREAD && readContractData();

    const writeContractData = async () => {
      setREP((await deOracleWRITE!.getREP()).toNumber());
      setWorldIdVerified(
        await deOracleWRITE!.addressToWorldIdVerified(account)
      );
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
    const updateEarnedBountyCount = async () => {
      deOracleWRITE &&
        setEarnedBountyCount(
          parseInt(
            ethers.utils.formatUnits(await deOracleWRITE.getBountyEarned(), 18)
          ).toFixed(2)
        );
    };
    deOracleWRITE &&
      (writeContractData(), updateVerifiedCount(), updateEarnedBountyCount());
  }, [deOracleREAD, deOracleWRITE, worldIdVerified, ENSVerified]);

  useEffect(() => {
    const updateRequestsCount = () => {
      if (requestList) {
        let requestCount = 0;
        for (let i = 0; i < Object.keys(requestList!).length; i++) {
          requestList[i].origin === account && requestCount++;
        }
        setRequestsCount(requestCount);
      }
    };

    const updateAnswersCount = () => {
      if (answerList) {
        let answerCount = 0;
        for (let i = 0; i < Object.keys(answerList!).length; i++) {
          answerList[i].origin === account && answerCount++;
        }

        setAnswersCount(answerCount);
      }
    };

    updateRequestsCount();
    updateAnswersCount();
  }, [deOracleREAD, requestsCount, answersCount, earnedBountyCount]);

  useEffect(() => {
    proofResponse && sendProof();
    async function sendProof() {
      let { merkle_root, nullifier_hash, proof } = proofResponse!;
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
  }, [proofResponse, deOracleWRITE, account]);

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
    if (window.ethereum.chainId && !supportedChainIds.includes(chainId!)) {
      library = { provider: window.ethereum };
      await switchNetwork(mumbai);
    }
    //TODO:
    try {
      await activate(injected);
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
      console.log(switchError);
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
    if (deOracleWRITE)
      try {
        txReceipt = await deOracleWRITE.setENSVerified(ENSName);
        //ENS Status loading spinner?
        txReceipt = await txReceipt.wait();

        if (txReceipt.status === 1) {
          setENSVerified(true);
        } else {
          console.log("Transaction failed, ENS not verified.");
        }
      } catch (err) {
        console.log(err);
      }
  }

  const requestCardList = () => {
    const keysDesc: any = Object.keys(requestList!).sort((a: any, b: any) => {
      return b - a;
    });
    const requestListDesc: any = [];

    for (let i = 0; i < keysDesc.length; i++) {
      const obj = requestList![keysDesc[i]];
      requestListDesc.push(obj);
    }

    const requestEls = requestListDesc.map((card: any) => {
      let i = requestListDesc.indexOf(card);
      return (
        <RequestCard
          key={id + i}
          requestData={card}
          answerFormData={answerFormData}
          updateAnswerFormData={setAnswerFormData}
          answerList={answerList}
          setSendAnswerState={setSendAnswerState}
          provider={provider}
          deOracleWRITE={deOracleWRITE}
          deOracleREAD={deOracleREAD}
          account={account}
          chainId={chainId}
          switchNetworkMumbai={() => switchNetwork(mumbai)}
          switchNetworkKovan={() => switchNetwork(kovan)}
          setNotificationMessage={setNotificationMessage}
          setNotificationError={setNotificationError}
          setDisplayNotification={setDisplayNotification}
        />
      );
    });
    return requestEls;
  };

  const toggleTheme = () => {
    if (darkMode) {
      localStorage.theme = "light";
      setDarkMode(false);
    } else {
      localStorage.theme = "dark";
      setDarkMode(true);
    }
  };

  function mintUsdc() {
    const usdcContract = new ethers.Contract(
      "0xFC07D8Ab694afF02301eddBe1c308Fe4a68F6121",
      usdcABI,
      provider.getSigner()
    );
    usdcContract.mint(account, "100000000000000000000");
  }

  return (
    <>
      <Head>
        <title>deOracle.xyz</title>
      </Head>
      {displayNotification && (
        <Notification
          notificationError={notificationError}
          notificationMessage={notificationMessage}
          setDisplayNotification={setDisplayNotification}
        />
      )}

      <ConnectHeader
        data={useWeb3React()}
        balance={balance}
        worldIdVerified={worldIdVerified}
        WorldIDWidget={<WorldIDWidget {...widgetProps} />}
        verifyENS={() => verifyENS()}
        ENSVerified={ENSVerified}
        ENSName={ENSName}
        REP={REP}
        darkMode={darkMode}
        requestsCount={requestsCount}
        answersCount={answersCount}
        earnedBountyCount={earnedBountyCount}
        verificationCount={verificationCount}
        handleSwitchNetworkMumbai={() => switchNetwork(mumbai)}
        handleSwitchNetworkKovan={() => switchNetwork(kovan)}
        handleClickConnect={() => connect()}
      />
      <div className="flex flex-col my-6 mx-3 md:m-10 justify-center">
        <RequestCreate
          account={account}
          deOracleWRITE={deOracleWRITE}
          provider={provider}
          deOracleAddress={deOracleAddress}
          setNotificationMessage={setNotificationMessage}
          setNotificationError={setNotificationError}
          setDisplayNotification={setDisplayNotification}
        />

        <div>{requestList && requestCardList()}</div>
      </div>
      <footer className="container text-center py-10 px-10 mt-10">
        <button
          type="button"
          onClick={toggleTheme}
          className={
            "fixed right-5 bottom-5 rounded-full drop-shadow-md w-18 h-18 px-5 py-5 hover:right-7 hover:bottom-7 border-4 bg-origin-border hover:border-8 border-white/60 dark:border-white/30 opacity-75 hover:opacity-100 transition-all ease-in-out duration-500 bg-gradient-to-b " +
            `${
              darkMode
                ? "from-blue-900 to-purple-900"
                : "from-blue-600 to-sky-400"
            }`
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={
              `${darkMode ? "hidden" : ""}` +
              " transition-all stroke-yellow-300 w-6 h-6 inline-block"
            }
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={
              `${darkMode ? "" : "hidden"}` +
              " transition-all stroke-yellow-300 w-6 h-6 inline-block"
            }
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        </button>

        <br />
        <br />
        <hr />
        <br />
        <br />

        <p className="mb-1 pt-2 text-slate-400">
          &copy; {copyrightYear} deOracle.xyz.{" "}
          <i>
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

        <p className="text-slate-600 ">
          {" "}
          <b>Faucet:</b> &nbsp;&nbsp;
          <a
            className="text-slate-600 underline hover:cursor-pointer hover:no-underline hover:text-slate-500"
            onClick={() => {
              networkActive && mintUsdc();
            }}
          >
            USDC
          </a>
          &nbsp;.&nbsp;
          <a
            className="text-slate-600 underline hover:cursor-pointer hover:no-underline hover:text-slate-500"
            href="https://faucet.polygon.technology/"
            target="_blank"
            rel="noreferrer"
          >
            MATIC
          </a>{" "}
          &nbsp;.&nbsp;
          <a
            className="text-slate-600 underline hover:cursor-pointer hover:no-underline hover:text-slate-500"
            href="https://kovan.optifaucet.com/"
            target="_blank"
            rel="noreferrer"
          >
            oETH
          </a>{" "}
          &nbsp; | &nbsp;
          <a
            href="#"
            className="text-slate-600 underline hover:no-underline hover:text-slate-500"
          >
            Back to Top
          </a>
        </p>
        <br />
      </footer>
    </>
  );
}
