import { useEffect, useState } from "react";
import { chainIdsMap, mumbai, goerli } from "../constants/networks";
import Image from "next/image";

export default function ConnectHeader(props: any) {
  const {
    data,
    handleClickConnect,
    balance,
    worldIdVerified,
    ENSVerified,
    WorldIDWidget,
    verificationCount,
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
    account &&
      setShortWallet(account.substring(0, 6) + "..." + account.slice(-4));
  }, [setShortWallet, account]);

  const switchNetwork = async (chain: any) => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chain.chainId }],
      });
    } catch (switchError: any) {
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

  function toggle() {
    setShowMe(!showMe);
  }

  //conditional tailwind styles based on verification
  const worldIdCondition = worldIdVerified
    ? "hover:cursor-pointer"
    : "opacity-20 hover:cursor-pointer";
  const ENSCondition = ENSVerified
    ? "hover:cursor-pointer"
    : "opacity-20 hover:cursor-pointer";

  return (
    <>
      <header
        className="sticky top-3 py-1 px-1 grid grid-flow-col auto-cols-max bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border grid justify-items-stretch grid-cols-2 gap-4"
        style={{ borderRadius: 16 + "px", zIndex: 999 }}
      >
        <div className="justify-self-start h-24 pt-4">
          <Image
            src="/logo.svg"
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
                " profile-button py-5 pl-2 md:pl-5 pr-8 md:pr-16 h-full align-middle justify-self-end"
              }
              onClick={toggle}
            >
              <div className="text-l flex flex-col">
                <p>
                  <span className="text-sm md:text-xl">
                    <b>{shortWallet}</b>{" "}
                  </span>
                  <span className="text-xs md:text-lg">
                    {" "}
                    - {Number(balance).toFixed(2)} {chainIdsMap[chainId]}
                  </span>
                </p>
                <div className="grid place-content-end md:place-items-center grid-cols-1 md:grid-cols-2 gap-1 md:gap-3 mt-1 text-right">
                  <p className="text-slate-600 text-xs md:text-sm">200 REP</p>
                  <p className="text-slate-600 text-xs md:text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={verificationCount ? "#f7eb02" : "none"}
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="inline-block w-5 h-5 mb-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>{" "}
                    {verificationCount
                      ? "Verified " + verificationCount + "/2"
                      : "Unverified 0/2"}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mr-5 grid align-middle justify-self-end content-center">
            <div>
              <button
                className="align-middle px-6 py-3 py-1 text-xl text-purple-600 font-semibold rounded-full border-2 border-purple-400 bg-gradient-to-r from-purple-100 from-purple-300 hover:bg-gradient-to-l hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
                onClick={() => handleClickConnect()}
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </header>

      <div
        className="container mx-auto mt-5 px-4"
        style={{ position: "fixed", zIndex: 99999 }}
      >
        <div
          className="nav-dropdown p-5 bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border"
          style={{
            display: showMe ? "block" : "none",
          }}
        >
          <p className="pb-3">
            <b>My Wallet:</b>{" "}
            <a
              href={"https://mumbai.polygonscan.com/address/" + account}
              className="underline hover:no-underline hover:text-slate-700"
              target="_blank"
            >
              {shortWallet}
            </a>
          </p>
          <hr />
          <p className="pt-3 text-slate-500">
            <b>Earned Bounty:</b> 0 USDC
          </p>
          <p className="py-1 text-slate-500">
            <b>Answers:</b> 0
          </p>
          <p className="pb-3 text-slate-500">
            <b>Requests:</b> 0
          </p>
          <hr />
          <p className="pt-3 pb-1">
            <b>Network:</b>{" "}
          </p>
          <div className="flex gap-2 justify-start pb-3">
            <b>
              <button
                className="text-purple-500 hover:text-purple-400"
                onClick={() => switchNetwork(mumbai)}
              >
                Polygon Mumbai
              </button>{" "}
              &nbsp; &nbsp; &nbsp; &nbsp;
              <button
                className="text-red-500 hover:text-red-400"
                onClick={() => switchNetwork(goerli)}
              >
                Goerli
              </button>
            </b>
          </div>
          <hr />
          <p className="pt-3 pb-4">
            <b>Verification ({verificationCount}/2):</b>
          </p>
          <div className="flex gap-3 pb-5">
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
              height="30"
              width="30"
              alt="World ID verified"
            />

            <Image
              className={ENSCondition}
              onClick={() =>
                console.log(ENSVerified ? "ENS verified." : "Not ENS verified.")
              }
              src="/ens.svg"
              height="30"
              width="30"
              alt="ENS verified"
            />
            {!worldIdVerified && WorldIDWidget}
          </div>
          <hr />
          <p className="pt-5">
            <b>
              <a href="#" className="text-red-500 hover:text-red-400">
                Disconnect
              </a>
            </b>
          </p>
        </div>
      </div>
    </>
  );
}
