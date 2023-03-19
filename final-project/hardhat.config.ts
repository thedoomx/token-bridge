import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("./tasks")

const config: HardhatUserConfig = {
  solidity: "0.8.0",
};

module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    localhost: {
      allowUnlimitedContractSize: true,
    },
    hardhat: {},
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
  mocha: {
    timeout: 300000, // 300 seconds max for running tests
  },
};

export default config;
