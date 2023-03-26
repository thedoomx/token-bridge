const { ethers } = require("hardhat");
const fetch = require("node-fetch"); //npm install node-fetch@2

const TokenBridge = require('../artifacts/contracts/Bridges/TokenBridge.sol/TokenBridge.json');
const SideTokenBridge = require('../artifacts/contracts/Bridges/SideTokenBridge.sol/SideTokenBridge.json');

const hre = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

async function run() {
  const contracts = await _setup();
  const tokenBridge = contracts[0];
  const sideTokenBridge = contracts[1];

  await _processPastEvents(tokenBridge);
  await _processPastEvents(sideTokenBridge);

  tokenBridge.on("Bridge", async (from, to, amount, nonce, signature, step) => {
    const transferEvent = {
      from: from,
      to: to,
      amount: amount.toNumber(),
      nonce: nonce.toNumber(),
      signature: signature,
      step: step,
      blockNumber: await provider.getBlock("latest").number
    };

    console.log("Latest block :" + transferEvent.blockNumber);
    console.log("Token Bridge: " + JSON.stringify(transferEvent, null, 4));

    await _postEvent(transferEvent);
  });

  sideTokenBridge.on("Bridge", async (from, to, amount, nonce, signature, step) => {
    const transferEvent = {
      from: from,
      to: to,
      amount: amount.toNumber(),
      nonce: nonce.toNumber(),
      signature: signature,
      step: step,
      blockNumber: await provider.getBlock("latest").number
    };

    console.log("Latest block :" + transferEvent.blockNumber);
    console.log("Side Token Bridge: " + JSON.stringify(transferEvent, null, 4));

    await _postEvent(transferEvent);
  });
}

async function _processPastEvents(tokenBridgeContract) {
  const last_processed_block = await _getLastProcessedBlock();
  const latestBlock = await provider.getBlock("latest");

  if (latestBlock == last_processed_block) {
    return;
  }

  let eventFilter = tokenBridgeContract.filters.Bridge()
  let events = await tokenBridgeContract.queryFilter(eventFilter, last_processed_block, "latest");

  await events.forEach(async event => {
    const { from, to, amount, nonce, signature, step } = event.args;
    const blockNumber = event.blockNumber;

    const transferEvent = {
      from: from,
      to: to,
      amount: amount.toNumber(),
      nonce: nonce.toNumber(),
      signature: signature,
      step: step,
      blockNumber: blockNumber
    };

    console.log("Past Bridge: " + JSON.stringify(transferEvent, null, 4));

    await _postEvent(transferEvent);
  })
}

async function _getLastProcessedBlock() {
  const url =
    hre.config.bridge_api.url + hre.config.bridge_api.endpoints.lastProcessedBlock;

  try {
    const response = await fetch(url, {
      method: "get",
    });

    if (!response.ok) {
      const message = 'Error with Status Code: ' + response.status;
      throw new Error(message);
    }

    const data = await response.json();
    if (data.length > 0) {
      return data[0].last_processed_block;
    }

  } catch (error) {
    console.log('Error: ' + error);
  }

  return 0;
}

async function _postEvent(transferEvent) {
  const postData = {
    from: transferEvent.from,
    to: transferEvent.to,
    amount: transferEvent.amount,
    nonce: transferEvent.nonce,
    signature: transferEvent.signature,
    step: transferEvent.step,
    blockNumber: transferEvent.blockNumber
  };

  try {
    const url =
      hre.config.bridge_api.url + hre.config.bridge_api.endpoints.event;

    const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const message = 'Error with Status Code: ' + response.status;
      throw new Error(message);
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log('Error: ' + error);
  }
}

async function _setup() {
  const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);

  const tokenBridgeAddress = hre.config.deployed_contracts.token_bridge_address;;
  const tokenBridgeContract = new ethers.Contract(tokenBridgeAddress, TokenBridge.abi, wallet);

  const sideTokenBridgeAddress = hre.config.deployed_contracts.side_token_bridge_address;;
  const sideTokenBridgeContract = new ethers.Contract(sideTokenBridgeAddress, SideTokenBridge.abi, wallet);

  return [tokenBridgeContract, sideTokenBridgeContract];
}

run();