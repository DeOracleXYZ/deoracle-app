import { useState } from 'react';
import { chainIdsMap, mumbai, goerli } from "../constants/networks";
import Image from 'next/image'


export default function ConnectHeader(props: any) {

  const { data, handleClickConnect, balance, worldIdVerified, ENSVerified } = props;
  const { active, account, chainId, library } = data;
  const [showMe, setShowMe] = useState(false);


  let shortWallet;
  if(account) {
    shortWallet = account.substring(0, 6) + "..." + account.slice(-4);
  } else {
    shortWallet = ""; 
  }

  const switchNetwork = async (chain: any) => {
      try {
        await library.provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chain.chainId }],
        });
      } catch (switchError) {
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
                  iconUrls: chain.iconUrls
                }
              ],
            });
          } catch (error) {
              console.error(error)
          }
        }
      }
    };



    
    function toggle(){
      setShowMe(!showMe);
    }
 
    //conditional tailwind styles based on verification
    const worldIdCondition = worldIdVerified ? "hover:cursor-pointer" : "opacity-20 hover:cursor-pointer"
    const ENSCondition = ENSVerified ? "hover:cursor-pointer" : "opacity-20 hover:cursor-pointer"


    return (
      <>
        <header className="sticky top-3 py-1 px-1 grid grid-flow-col auto-cols-max bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border grid justify-items-stretch grid-cols-2 gap-4" style={{borderRadius: 16 + 'px'}}>
          <div className='justify-self-start'>
            <img src="/logo.svg" className="h-24 px-5 pt-4" /> 
          </div>
            {active ? (
                <>
                  <div className={`${ showMe ? "active" : "" }` + ' profile-button py-5 px-5 h-full align-middle justify-self-end'} onClick={toggle}>
                      
                      <div className="text-l flex flex-col">

                        <p><span className="text-xl"><b>{shortWallet}</b> - {Number(balance).toFixed(2)}</span> <small>{chainIdsMap[chainId]}</small></p>
                        <div className="flex place-content-end gap-3 mt-1 ">
                          <p className="text-slate-600 text-sm">200 REP</p>
                          <p className="text-slate-600 text-sm"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline-block w-4 h-4 mb-1"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg> Unverified (0 / 3)</p>
                        </div>

                      </div>
                  </div>
                </>
                ) : (
                <div className="mt-5 mr-5 align-middle justify-self-end">
                    <button className="align-middle px-4 py-1 text-md text-blue-600 font-semibold rounded-full border border-blue-200 bg-gradient-to-r from-indigo-100 from-indigo-300 hover:bg-gradient-to-l hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2" onClick={() => handleClickConnect()}>Connect</button>
                </div>
            )}
        </header>
            
        <div className="container mx-auto mt-5 px-4" style={{ position: "fixed" }}>
         <div className="nav-dropdown p-5 bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border" style={{
            display: showMe ? "block" : "none"
          }}>
            <p className="pb-3"><b>Wallet:</b> {shortWallet}</p>
            <hr />
            <p className="pt-3"><b>Earned Bounty:</b> 0 USDC</p>
            <p className="py-1"><b>Answers:</b> 0</p>
            <p className="pb-3"><b>Requests:</b> 0</p>
            <hr />
            <p className="pt-3 pb-1"><b>Network:</b> </p>
            <div className='flex gap-2 justify-start pb-3'>
              <b><button className="text-purple-500 hover:text-purple-400" onClick={() => switchNetwork(mumbai)}>Polygon Mumbai</button> &nbsp; &nbsp; &nbsp; &nbsp;
              <button className="text-red-500 hover:text-red-400" onClick={() => switchNetwork(goerli)}>Goerli</button></b>
            </div>
            <hr />
            <p className="pt-3 pb-1"><b>Verification (0 / 3):</b></p>
            <div className="flex gap-3 pb-3">
              <Image className={worldIdCondition} onClick={() => console.log(worldIdVerified ? "World ID verified." : "Not World ID verified.")} src="/world-id.svg" height="30" width="30" alt="World ID verified" />

              <Image className={ENSCondition} onClick={() => console.log(ENSVerified ? "ENS verified." : "Not ENS verified.")} src="/ens.svg" height="30" width="30" alt="ENS verified" />

            </div>
            <hr />
            <p className="pt-3"><b><a href="#" className="text-red-500 hover:text-red-400">Disconnect</a></b></p>
          </div>
        </div>
      </>
    );
}