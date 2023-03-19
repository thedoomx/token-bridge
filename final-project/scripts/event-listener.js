const { ethers } = require("hardhat");
const fetch = require("node-fetch"); //npm install node-fetch@2

const MyTokenOne = require('../artifacts/contracts/Tokens/MyTokenOne.sol/MyTokenOne.json');
const MyTokenTwo = require('../artifacts/contracts/Tokens/MyTokenTwo.sol/MyTokenTwo.json');
const TokenBridge = require('../artifacts/contracts/Bridges/TokenBridge.sol/TokenBridge.json');
const SideTokenBridge = require('../artifacts/contracts/Bridges/SideTokenBridge.sol/SideTokenBridge.json');

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

async function run() {
    const contracts = await _setup();
    const tokenBridge = contracts[0];
    const sideTokenBridge = contracts[1];

    tokenBridge.on("Bridge", async (from, to, amount, nonce, signature, step) => {
        let transferEvent = {
            from: from,
            to: to,
            amount: amount.toNumber(),
            nonce: nonce.toNumber(),
            signature: signature,
            step: step,
        };
        const latestBlock = await provider.getBlock("latest");
        console.log("Latest block :" + latestBlock.number);
        console.log(JSON.stringify(transferEvent, null, 4));
        
        await postEvent(transferEvent);
    });

    sideTokenBridge.on("Bridge", async (from, to, amount, nonce, signature, step) => {
        let transferEvent = {
            from: from,
            to: to,
            amount: amount.toNumber(),
            nonce: nonce.toNumber(),
            signature: signature,
            step: step,
        };
        const latestBlock = await provider.getBlock("latest");
        console.log("Latest block :" + latestBlock.number);
        console.log(JSON.stringify(transferEvent, null, 4));
        await postEvent(transferEvent);
    });
}

async function postEvent(transferEvent) {
    const postData = {
        from: transferEvent.from,
        to: transferEvent.to,
        amount: transferEvent.amount,
        nonce: transferEvent.nonce,
        signature: transferEvent.signature,
        step: transferEvent.step
      };
      
      try {
        const response = await fetch('http://localhost:3010/event', {
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
    const [owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();
    const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    
    const contractMyTokenOne = "0x663F3ad617193148711d28f5334eE4Ed07016602";
    const myTokenOneContract = new ethers.Contract(contractMyTokenOne, MyTokenOne.abi, wallet);
    console.log(await myTokenOneContract.balanceOf(addr2.address)); //by 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
  
    const contractMyTokenTwo = "0x057ef64E23666F000b34aE31332854aCBd1c8544";
    const myTokenTwoContract = new ethers.Contract(contractMyTokenTwo, MyTokenTwo.abi, wallet);
    console.log(await myTokenTwoContract.balanceOf(addr3.address)); //by 0x90F79bf6EB2c4f870365E785982E1f101E93b906

    const tokenBridge = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const tokenBridgeContract = new ethers.Contract(tokenBridge, TokenBridge.abi, wallet);

    const sideTokenBridge = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const sideTokenBridgeContract = new ethers.Contract(sideTokenBridge, SideTokenBridge.abi, wallet);

    return [tokenBridgeContract, sideTokenBridgeContract];
  }
  
  run();