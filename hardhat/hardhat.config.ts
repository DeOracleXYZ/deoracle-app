import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import '@openzeppelin/hardhat-upgrades';
import 'dotenv/config'

const config: HardhatUserConfig = {
  defaultNetwork: "mumbai",
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/7ifRMY_6b1FpBvwH0rGegS97INzbl4C9",
      accounts: [process.env.private_key!]
    }
  },
  solidity: "0.8.17",
};

export default config;
