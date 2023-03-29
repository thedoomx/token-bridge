import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require("./tasks")
require('dotenv').config({ path: __dirname + '/.env' })
const { API_BASE_URL, TOKEN_BRIDGE_ADDRESS, SIDE_TOKEN_BRIDGE_ADDRESS, WALLET } = process.env

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
  bridge_api: {
    url: API_BASE_URL,
    endpoints: {
      getLockedTokensAmount: "getLockedTokensAmount?from=%s&to=%s",
      getClaimedTokensAmount: "getClaimedTokensAmount?from=%s&to=%s",
      getBurnedTokensAmount: "getBurnedTokensAmount?from=%s&to=%s",
      getReleasedTokensAmount: "getReleasedTokensAmount?from=%s&to=%s",
      lastProcessedBlock: "lastprocessedblock",
      event: "event",
    }
  },
  deployed_contracts: {
    token_bridge_address: TOKEN_BRIDGE_ADDRESS,
    side_token_bridge_address: SIDE_TOKEN_BRIDGE_ADDRESS,
  },
  wallet: WALLET
};

export default config;
