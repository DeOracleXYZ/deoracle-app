import "../styles/globals.css";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

const getLibrary = (provider: any) => {
  return new Web3Provider(provider, "any");
};

function MyApp({ Component, pageProps }: { Component: any; pageProps: any }) {
  return (
    <div className="container mx-auto px-4">
      <Web3ReactProvider getLibrary={getLibrary}>
        <Component {...pageProps} />
      </Web3ReactProvider>
    </div>
  );
}

export default MyApp;
