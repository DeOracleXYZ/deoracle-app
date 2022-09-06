import { mumbai, goerli } from "/constants/networks";
import { WorldIDWidget } from "@worldcoin/id";

export default function ConnectHeader(props) {

    const { active, account, balance, handleClickConnect, library } = props;

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
        <header className="sticky top-3 columns-2 px-5 pt-5 bg-neutral-100 rounded-xl shadow-xl backdrop-blur-md bg-white/30 nav-border" style={{borderRadius: 16 + 'px'}}>
          <img src="/logo.svg" className="h-24" /> 
            {active ? (
                <>
                 
                    <div className='flex mt-5 mr-10 justify-end'>
                        <WorldIDWidget
                            actionId="wid_staging_ed5840f20f5c5ac1b07a144005e45d6a" // obtain this from developer.worldcoin.org
                            signal="my_signal"
                            enableTelemetry
                            onSuccess={(verificationResponse) => console.log(verificationResponse)} // you'll actually want to pass the proof to the API or your smart contract
                            onError={(error) => console.error(error)}
                        />
                        <div className='flex flex-col justify-center'>
                            <p className="text-l font-bold">Connected account:</p>
                            <p className="text-l">{account}</p>
                            <p className="text-l">{balance}</p>
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
        </header>
    );
}