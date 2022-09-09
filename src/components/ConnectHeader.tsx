import { chainIdsMap, mumbai, goerli } from "../constants/networks";
import Image from 'next/image'


export default function ConnectHeader(props) {

    const { data, handleClickConnect, balance, worldIdVerified, ENSVerified } = props;
    const { active, account, chainId, library } = data;

    const switchNetwork = async (chain) => {
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

    const worldIdCondition = worldIdVerified ? "hover:cursor-pointer" : "opacity-20 hover:cursor-pointer"
    const ENSCondition = ENSVerified ? "hover:cursor-pointer" : "opacity-20 hover:cursor-pointer"


    return (
        <header className="sticky top-3 grid grid-flow-col auto-cols-max px-5 pt-5 bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border grid justify-items-stretch grid-cols-2 gap-4" style={{borderRadius: 16 + 'px'}}>
          <div className='justify-self-start'>
            <img src="/logo.svg" className="h-24" /> 
          </div>
            {active ? (
                <>
                  <div className='my-5 mr-5 align-middle justify-self-end'>
                      <div className="text-l flex flex-col">
                        <b>Connected account:</b>
                        {account.substring(0, 6) + "..." + account.slice(-4)} ({Number(balance).toFixed(2)} {chainIdsMap[chainId]})
                        <div className="flex gap-3">
                          <Image className={worldIdCondition} onClick={() => console.log(worldIdVerified)} src="/world-id.svg" height="30" width="30" alt="World ID verified" />
                          <Image className={ENSCondition} onClick={() => console.log(ENSVerified)} src="/ens.svg" height="30" width="30" alt="ENS verified" />
                          
                          
                        </div>
                      </div>
                      
                      <div className='flex gap-2 justify-end'>
                      <button className="text-purple-500" onClick={() => switchNetwork(mumbai)}>Mumbai</button>
                      <button className="text-red-500" onClick={() => switchNetwork(goerli)}>Goerli</button>
                      </div>
                  </div>
                </>
                ) : (
                <div className="mt-5 mr-5 align-middle justify-self-end">
                    <button className="align-middle px-4 py-1 text-md text-blue-600 font-semibold rounded-full border border-blue-200 bg-gradient-to-r from-indigo-100 from-indigo-300 hover:bg-gradient-to-l hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2" onClick={() => handleClickConnect()}>Connect</button>
                </div>
            )}
        </header>
    );
}