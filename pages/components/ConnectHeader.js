import { mumbai, goerli } from "/constants/networks"


console.log(mumbai[0], goerli)
export default function ConnectHeader(props) {

    const { active, account, handleClickConnect, library } = props;

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
        <>
            {active ? (
                <>
                    <div className='flex mt-5 mr-10 justify-end'>
                        <div className='flex flex-col justify-center'>
                            <p className="text-l font-bold">Connected account:</p>
                            <p className="text-l">{account}</p>
                            <div className='flex gap-2 justify-end'>
                            <button className="text-purple-500" onClick={() => switchNetwork(mumbai)}>Mumbai</button>
                            <button className="text-red-500" onClick={() => switchNetwork(goerli)}>Goerli</button>
                            </div>
                        </div>
                    </div>
                </>
                ) : (
                <div className='flex mt-5 mr-10 justify-end'>
                    <button className="px-4 py-1 text-sm text-blue-600 font-semibold rounded-full border border-blue-200 hover:text-white hover:bg-blue-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"onClick={() => handleClickConnect()}>Connect</button>
                </div>
            )}
        </>
    );
}