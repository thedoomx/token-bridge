const { ethers } = require("hardhat");

const TokenBridge = require('../artifacts/contracts/Bridges/TokenBridge.sol/TokenBridge.json');
const TokenBridgeSide = require('../artifacts/contracts/Bridges/SideTokenBridge.sol/SideTokenBridge.json');

const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")

const myTokenOneAddress = "0x663F3ad617193148711d28f5334eE4Ed07016602";
const myTokenTwoAddress = "0x057ef64E23666F000b34aE31332854aCBd1c8544";

const run = async function () {
  const contracts = await _setup();
  const bridgeMain = contracts[0];
  const bridgeSide = contracts[1];

  const [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

  var amount = 5;
  const signedMessage = await _signMessage(myTokenOneAddress, addr2, addr4, amount);

  var wrongMessage = "0xe8bb32123120702370c003a0806327e461dac80569234c5426a2ee6beef044662ec86f78890202e6251dae89f15bc43fd4475ca69595b3608285541d0e67f3d114";
  //console.log(signedMessage)

  // var temp = await bridgeMain.lock(myTokenOneAddress, addr2.address, addr4.address, amount, signedMessage);
  // console.log(await temp)
  // var temp2= await bridgeMain.test(myTokenOneAddress, addr2.address);
  // console.log(await temp2.wait())
  var temp3= await bridgeMain.test2(myTokenOneAddress, addr2.address);
  console.log(temp3);

}

async function _signMessage(originalTokenAddress, from, to, amount) {
  const messageHash = ethers.utils.solidityKeccak256(
    ['address', 'address', 'uint256'],
    [from.address, to.address, amount]
  )
  const arrayfiedHash = ethers.utils.arrayify(messageHash);

  const signedMessage = await from.signMessage(arrayfiedHash);

  return signedMessage;
}

async function _setup() {
  //get last logged block

  //get logs from last logged block to latest
  // const logs = await this.provider.getLogs({
  //  fromBlock: 12794325,
  //  toBlock: 'latest',
  //  address: this.Dao.address,
  //  topics: , //filter
  //});

  // store logs in API & DB

  //continue
  const latestBlock = await provider.getBlock("latest");
  const wallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", provider);
  const balance = await wallet.getBalance();
  //console.log("Balance:" + balance);
  const tokenBridgeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const bridgeMainContract = new ethers.Contract(tokenBridgeAddress, TokenBridge.abi, wallet);

  const tokenBridgeSideAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const bridgeSideContract = new ethers.Contract(tokenBridgeSideAddress, TokenBridgeSide.abi, wallet);

  return [bridgeMainContract, bridgeSideContract];
}

run()
