const { ethers } = require("hardhat");

const MyTokenOne = require('../artifacts/contracts/Tokens/MyTokenOne.sol/MyTokenOne.json');
const MyTokenTwo = require('../artifacts/contracts/Tokens/MyTokenTwo.sol/MyTokenTwo.json');
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

const run = async function () {
  const contracts = await _setup();
}

async function _setup() {
  const [owner, addr1, addr2, addr3] = await ethers.getSigners();
  const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
  const balance = await wallet.getBalance();
  const contractMyTokenOne = "0x663F3ad617193148711d28f5334eE4Ed07016602";
  const myTokenOneContract = new ethers.Contract(contractMyTokenOne, MyTokenOne.abi, wallet);
  console.log(await myTokenOneContract.balanceOf(addr2.address)); //by 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC

  const contractMyTokenTwo = "0x057ef64E23666F000b34aE31332854aCBd1c8544";
  const myTokenTwoContract = new ethers.Contract(contractMyTokenTwo, MyTokenTwo.abi, wallet);
  console.log(await myTokenTwoContract.balanceOf(addr3.address)); //by 0x90F79bf6EB2c4f870365E785982E1f101E93b906
}

run()
