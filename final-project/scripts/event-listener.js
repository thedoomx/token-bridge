const { ethers } = require("hardhat");
const fetch = require("node-fetch"); //npm install node-fetch@2

const TokenBridge = require('../artifacts/contracts/Bridges/TokenBridge.sol/TokenBridge.json');
const SideTokenBridge = require('../artifacts/contracts/Bridges/SideTokenBridge.sol/SideTokenBridge.json');

const hre = require("hardhat");
const networkMainProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
const networkSideProvider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

async function run() {
  const contracts = await _setup();
  const tokenBridge = contracts[0];
  const sideTokenBridge = contracts[1];


  await _processPastEvents(
    await _getPastEvents(tokenBridge, networkMainProvider, true),
    await _getPastEvents(sideTokenBridge, networkSideProvider, false));

  return;
  tokenBridge.on("Bridge", async (from, to, amount, nonce, signature, step) => {
    const latestBlock = await networkMainProvider.getBlock("latest");
    const transferEvent = {
      from: from,
      to: to,
      amount: amount.toNumber(),
      nonce: nonce.toNumber(),
      signature: signature,
      step: step,
      blockNumber: latestBlock.number
    };

    console.log("Latest block :" + transferEvent.blockNumber);
    console.log("Token Bridge: " + JSON.stringify(transferEvent, null, 4));

    await _postEvent(transferEvent);
  });

  sideTokenBridge.on("Bridge", async (from, to, amount, nonce, signature, step) => {
    const latestBlock = await networkSideProvider.getBlock("latest");
    const transferEvent = {
      from: from,
      to: to,
      amount: amount.toNumber(),
      nonce: nonce.toNumber(),
      signature: signature,
      step: step,
      blockNumber: latestBlock.number
    };

    console.log("Latest block :" + transferEvent.blockNumber);
    console.log("Side Token Bridge: " + JSON.stringify(transferEvent, null, 4));

    await _postEvent(transferEvent);
  });
}

async function _processPastEvents(mainNetworkEvents, sideNetworkPastEvents) {
  if (mainNetworkEvents == undefined)
    mainNetworkEvents = [];
  if (sideNetworkPastEvents == undefined)
    sideNetworkPastEvents = [];

  const sortedEvents = mainNetworkEvents.concat(sideNetworkPastEvents).sort(function (a, b) {
    return a.nonce - b.nonce;
  });

  sortedEvents.forEach(async pastEvent => {

    console.log("Past Bridge: " + JSON.stringify(pastEvent, null, 4));

    await _postEvent(pastEvent);
  });
}

async function _getPastEvents(tokenBridgeContract, networkProvider, isMainNetwork) {
  const last_processed_block = await _getLastProcessedBlock(isMainNetwork);
  const latestBlock = await networkProvider.getBlock("latest");

  if (last_processed_block == latestBlock.number) {
    return;
  }
  const eventFilter = tokenBridgeContract.filters.Bridge()
  const events = await tokenBridgeContract.queryFilter(eventFilter, last_processed_block, "latest");

  let pastEvents = [];

  events.forEach(event => {
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

    pastEvents.push(transferEvent);
  });

  return pastEvents;
}

async function _getLastProcessedBlock(isMainNetwork) {
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
      if (isMainNetwork) {
        return data[0].last_processed_block_main;
      }
      else {
        return data[0].last_processed_block_side;
      }
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
  } catch (error) {
    console.log('Error: ' + error);
  }
}

async function _setup() {
  const walletMain = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", networkMainProvider);
  const walletSide = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", networkSideProvider);

  const tokenBridgeAddress = hre.config.deployed_contracts.token_bridge_address;;
  const tokenBridgeContract = new ethers.Contract(tokenBridgeAddress, TokenBridge.abi, walletMain);

  const sideTokenBridgeAddress = hre.config.deployed_contracts.side_token_bridge_address;;
  const sideTokenBridgeContract = new ethers.Contract(sideTokenBridgeAddress, SideTokenBridge.abi, walletSide);

  return [tokenBridgeContract, sideTokenBridgeContract];
}

run();