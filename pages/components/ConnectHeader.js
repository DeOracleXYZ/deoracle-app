import { chainIdsMap, mumbai, goerli } from "/constants/networks";

export default function ConnectHeader(props) {

    const { active, account, balance, chainId, handleClickConnect, library } = props;

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

    return (
        <header className="sticky top-3 grid grid-flow-col auto-cols-max px-5 pt-5 bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border grid justify-items-stretch grid-cols-2 gap-4" style={{borderRadius: 16 + 'px'}}>
          <div className='justify-self-start'>
            <img src="/logo.svg" className="h-24" /> 
          </div>
            {active ? (
                <>
                  <div className='my-5 mr-5 align-middle justify-self-end'>
                      <p className="text-l"><b>Connected account:</b> {account.substring(0, 6) + "..." + account.slice(-4)} ({Number(balance).toFixed(2)} {chainIdsMap[chainId]})</p>
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