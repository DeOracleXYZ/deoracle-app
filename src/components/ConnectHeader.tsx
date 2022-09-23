import { useEffect, useState } from "react";
import Image from "next/image";
import { chainIdsMap } from "../constants/networks";

export default function ConnectHeader(props: any) {
  const {
    data,
    handleClickConnect,
    handleSwitchNetworkMumbai,
    handleSwitchNetworkKovan,
    balance,
    worldIdVerified,
    ENSVerified,
    ENSName,
    darkMode,
    WorldIDWidget,
    verifyENS,
    requestsCount,
    answersCount,
    earnedBountyCount,
    verificationCount,
    REP,
  } = props;
  const {
    active,
    account,
    chainId,
    library,
  }: { active: any; account: string; chainId: number; library: any } = data;
  const [showMe, setShowMe] = useState(false);
  const [shortWallet, setShortWallet] = useState("");

  useEffect(() => {
    if(account) {
      ENSName ? setShortWallet(ENSName) :
      setShortWallet(account.substring(0, 6) + "..." + account.slice(-4));
    }    
  }, [setShortWallet, account, ENSName]);

  function toggle() {
    setShowMe(!showMe);
  }

  //conditional tailwind styles based on verification
  const worldIdCondition = worldIdVerified
    ? "hover:cursor-pointer"
    : "opacity-20 dark:opacity-30 hover:cursor-pointer";
  const ENSCondition = ENSVerified
    ? "hover:cursor-pointer"
    : "opacity-20 dark:opacity-30 hover:cursor-pointer";

  return (
    <>
      <header
        className="sticky top-3 py-1 px-1 grid grid-flow-col auto-cols-max bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 dark:bg-white/10 nav-border grid justify-items-stretch grid-cols-2 gap-4"
        style={{ borderRadius: 16 + "px", zIndex: 999 }}
      >
        <div className="justify-self-start h-24 pt-4">
         <Image
          src={"/logo"+`${darkMode ? "-dark" : ""}`+".svg"}
          alt="deOracle.xyz Logo"
          width={342}
          height={80}
          style={{ textAlign: "left" }}
        />
        </div>
        {active ? (
          <>
            <div
              className={
                `${showMe ? "active" : ""}` +
                " profile-button py-5 pl-2 md:pl-5 pr-8 md:pr-14 h-full align-middle justify-self-end"
              }
              onClick={toggle}
            >
              <div className="text-right flex flex-col dark:text-slate-300">
                <p>
                  <span className="text-sm md:text-xl">
                    <b>{shortWallet}</b>{" "}
                  </span>
                  <span className="text-xs md:text-lg">
                    {" "}
                    - {Number(balance).toFixed(2)} <small className="text-xs">{chainIdsMap[chainId]}</small>
                  </span>
                </p>
                <div className="grid place-content-end md:place-items-right grid-cols-1 gap-1 mt-1">
                  <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm text-right">
                    <span className="inline-block align-top">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={verificationCount ? "#f7eb02" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="inline-block w-4 h-4 mb-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>&nbsp; 
                    </span>
                    <span className="inline-block align-top">Reputation: <b>{REP} RP</b></span>
                    <span>&nbsp;</span>
                    
                    {/* <span className="inline-block align-top mb-2">Verification {verificationCount
                      ? "(" + verificationCount + "/2)"
                      : "(0/2)"}: </span> */}
                    <span className="whitespace-nowrap">
                      <span className="ml-2 inline-block align-baseline">
                      <Image
                        className={worldIdCondition}
                        onClick={() =>
                          console.log(
                            worldIdVerified
                              ? "World ID verified."
                              : "Not World ID verified."
                          )
                        }
                        src="/world-id.svg"
                        height="18"
                        width="18"
                        alt="WorldCoin"
                        title="WorldCoin ID Verification"
                      />
                      </span>
                      <span className="ml-2 inline-block align-baseline">
                      <Image
                        className={ENSCondition}
                        onClick={() =>
                          console.log(ENSVerified ? "ENS verified." : "Not ENS verified.")
                        }
                        src="/ens.svg"
                        height="18"
                        width="18"
                        alt="ENS"
                        title="ENS Verification"
                      />
                      </span>
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mr-5 grid align-middle justify-self-end content-center">
            <div>
              <button
                className="align-middle px-6 py-3 py-1 text-xl text-purple-600 font-semibold rounded-full border-2 border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 dark:text-black/80"
                onClick={() => handleClickConnect()}
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </header>

      <div
        className="container mx-auto mt-3 px-4"
        style={{ position: "fixed", zIndex: 99999 }}
      >
        <div
          className="nav-dropdown p-5 bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 dark:bg-white/10 nav-border dark:text-slate-300"
          style={{
            display: showMe ? "block" : "none",
          }}
        >
          <p className="pb-3">
            <b>My Wallet:</b>{" "}
            <a
              href={"https://mumbai.polygonscan.com/address/" + account}
              className="underline hover:no-underline text-slate-500 dark:text-slate-400 hover:text-slate-400 dark:hover:text-slate-300"
              target="_blank"
              rel="noreferrer"
            >
              {shortWallet}
            </a>
          </p>
          <hr />
          <p className="pt-3 pb-3">
            <b>Verification ({verificationCount}/2):</b>
          </p>
          <div className="pb-4">
            {(verificationCount == 2) && <p className="italic text-sm pr-24 font-bold text-slate-500 dark:text-slate-400">⭐️ Your identity has been verified with Worldcoin and ENS.</p>  }
            {!worldIdVerified && WorldIDWidget}

            {(!ENSName && !ENSVerified) &&  <a href="https://app.ens.domains/" target="_blank" 
              rel="noreferrer" className="verify-ens block w-full border-2 text-slate-700 border-sky-500 rounded-xl mt-2 px-5 py-4 pl-11 text-sm font-bold relative dark:bg-black dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 absolute left-4 top-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg> Get ENS domain  <span className="absolute right-5 top-2"><Image src="/ens.svg" height="36" width="36" alt="Get ENS" /></span></a>}

            {(ENSName && !ENSVerified) && <button onClick={verifyENS} className="verify-ens block w-full border-2 text-slate-700 border-sky-500 rounded-xl mt-2 px-5 py-4 pl-11 text-sm font-bold relative dark:bg-black dark:text-white text-left">
              {ENSVerified ? <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 absolute stroke-green-500 left-3.5 top-3.5 "><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> : <span className="absolute left-4 top-4 border border-slate-700 dark:border-white rounded-full w-5 h-5"> </span>} Verify my ENS <span className="absolute right-5 top-2"><Image className="" src="/ens.svg" height="36" width="36" alt="ENS" /></span></button>}
          </div>
          <hr />
          <p className="pt-3 text-sm">
            <b>Earned Bounty:</b> <span className="text-slate-500 dark:text-slate-400">{earnedBountyCount} USDC</span>
          </p>
          <p className="py-1 text-sm">
            <b>Answers:</b> <span className="text-slate-500 dark:text-slate-400">{answersCount}</span>
          </p>
          <p className="pb-3 text-sm">
            <b>Requests:</b> <span className="text-slate-500 dark:text-slate-400">{requestsCount}</span>
          </p>
          <hr />
          <p className="pt-3 pb-1">
            <b>Network:</b>{" "}
          </p>
          <div className="flex gap-2 justify-start">
            <b>
              <button
                className={"text-sm text-purple-500 hover:text-purple-400 " + `${(chainId === 80001) ? "border-2" : ""}` + " border-purple-500 px-3 py-2 rounded-lg"}
                onClick={() => (handleSwitchNetworkMumbai())}
              >
                Polygon Mumbai
              </button>{" "}
              &nbsp; &nbsp; 
              <button
                className={"text-sm text-red-500 hover:text-red-400 " + `${(chainId === 69) ? "border-2" : "" }` + " border-red-500 px-3 py-2 rounded-lg"}
                onClick={() => (handleSwitchNetworkKovan())}
              >
                Optimism Kovan
              </button>
            </b>
          </div>
        </div>
      </div>
    </>
  );
}
