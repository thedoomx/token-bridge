const { ethers } = require("ethers");
const fetch = require("node-fetch"); //npm install node-fetch@2

const BridgeTempMain = require('../artifacts/contracts/Bridges/BridgeTempMain.sol/BridgeTempMain.json');
const BridgeTempSide = require('../artifacts/contracts/Bridges/BridgeTempSide.sol/BridgeTempSide.json');
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

async function run() {
    const contracts = await _setup();
    const bridgeMain = contracts[0];

    await fetch("http://localhost:3010/lastprocessedblock")
        .then(response => response.json())
        .then(json => console.log(json[0].last_processed_block))

    bridgeMain.on("Transfer", async (from, to, value) => {
        let transferEvent = {
            from: from,
            to: to,
            value: value.toNumber()
        };
        const latestBlock = await provider.getBlock("latest");
        console.log("Latest block :" + latestBlock.number);
        console.log(JSON.stringify(transferEvent, null, 4));
    })
}

run();

async function _setup() {
    const latestBlock = await provider.getBlock("latest");
    console.log("Latest block :" + latestBlock.number);

    const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
    const balance = await wallet.getBalance();
    //console.log("Balance:" + balance);
    const contractBridgeMainAddress = "0x610178dA211FEF7D417bC0e6FeD39F05609AD788";
    const bridgeMainContract = new ethers.Contract(contractBridgeMainAddress, BridgeTempMain.abi, wallet);

    const contractBridgeSideAddress = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";
    const bridgeSideContract = new ethers.Contract(contractBridgeSideAddress, BridgeTempSide.abi, wallet);

    return [bridgeMainContract, bridgeSideContract];
}