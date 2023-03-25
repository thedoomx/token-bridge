import { expect } from "chai";
import { ethers } from "hardhat";
import { MyTokenOne } from "../typechain-types/contracts/Tokens/MyTokenOne";
import { TokenBridge } from "../typechain-types/contracts/Bridges/TokenBridge";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("TokenBridge", function () {
  let myTokenOneFactory;
  let myTokenOne: MyTokenOne;
  let originalTokenAddress: string;

  let tokenBridgeFactory;
  let tokenBridge: TokenBridge;

  let nonce: number = 1;

  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;
  let addr4: SignerWithAddress;
  let addr5: SignerWithAddress;

  let from: string;
  let to: string;
  let amount: number;

  let messageHash: string;
  let arrayfiedHash: Uint8Array;
  let signedMessage: string;

  before(async () => {
    [owner, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

    myTokenOneFactory = await ethers.getContractFactory("MyTokenOne");
    myTokenOne = await myTokenOneFactory.connect(addr2).deploy();
    await myTokenOne.deployed();
    originalTokenAddress = myTokenOne.address;

    tokenBridgeFactory = await ethers.getContractFactory("TokenBridge");
    tokenBridge = await tokenBridgeFactory.deploy();
    await tokenBridge.deployed();
  });

  it("Lock: Should be rejected with - ERC20: insufficient allowance", async function () {
    from = addr2.address;
    to = addr4.address;
    amount = 2;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, amount, nonce, signedMessage))
      .to.be.rejectedWith('ERC20: insufficient allowance');
  });
  it("Lock: Should be rejected with - wrong signature", async function () {
    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, 5, nonce, signedMessage))
      .to.be.rejectedWith('wrong signature');
  });

  it("Lock: Should be rejected with - insufficient assets", async function () {
    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, 2000, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, 2000, nonce, signedMessage))
      .to.be.rejectedWith('insufficient assets');
  });
  it("Lock: Should be rejected with - amount must be above 0", async function () {
    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, 0, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, 0, nonce, signedMessage))
      .to.be.rejectedWith('amount must be above 0');
  });
  it("Lock: Should emit Bridge event for Lock operation", async function () {
    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    myTokenOne.connect(addr2).approve(tokenBridge.address, amount);
    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, amount, nonce, signedMessage))
      .to.emit(tokenBridge, "Bridge")
      .withArgs(from, to, amount, nonce, signedMessage, 0);
  });
  it("Lock: Should be rejected with - this transaction has already been processed", async function () {

    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, amount, nonce, signedMessage))
      .to.be.rejectedWith('this transaction has already been processed');
  });
  it("Lock: Should validate wrapped token balance by sender", async function () {

    await expect(await tokenBridge.getWrappedTokenBalance(originalTokenAddress, from)).to.equal(amount);
  });
  it("Lock: Should validate original token balance by sender", async function () {

    await expect(await myTokenOne.balanceOf(from)).to.equal(1000 - amount);
  });
  it("Lock: Should validate original token balance by bridge", async function () {

    await expect(await myTokenOne.balanceOf(tokenBridge.address)).to.equal(amount);
  });



  it("Release: Should be rejected with - amount must be above 0", async function () {
    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, 0, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(tokenBridge.connect(addr2).release(originalTokenAddress, from, to, 0, nonce, signedMessage))
      .to.be.rejectedWith('amount must be above 0');
  });
  it("Release: Should be rejected with - wrong signature", async function () {
    from = addr4.address;
    to = addr2.address;
    amount = 2;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr4.signMessage(arrayfiedHash);

    await expect(tokenBridge.connect(addr2).release(originalTokenAddress, from, to, 5, nonce, signedMessage))
      .to.be.rejectedWith('wrong signature');
  });
  it("Release: Should emit Bridge event for Release operation", async function () {
    await expect(tokenBridge.connect(addr2).release(originalTokenAddress, from, to, amount, nonce, signedMessage))
      .to.emit(tokenBridge, "Bridge")
      .withArgs(from, to, amount, nonce, signedMessage, 3);
  });
  it("Release: Should be rejected with - this transaction has already been processed", async function () {
    await expect(tokenBridge.connect(addr2).release(originalTokenAddress, from, to, amount, nonce, signedMessage))
      .to.be.rejectedWith('this transaction has already been processed');
  });
  it("Release: Should validate wrapped token balance by sender", async function () {

    await expect(await tokenBridge.getWrappedTokenBalance(originalTokenAddress, to)).to.equal(0);
  });
  it("Release: Should validate original token balance by sender", async function () {

    await expect(await myTokenOne.balanceOf(to)).to.equal(1000);
  });
  it("Release: Should validate original token balance by bridge", async function () {

    await expect(await myTokenOne.balanceOf(tokenBridge.address)).to.equal(0);
  });



  it("Lock: Should emit Bridge event for Lock operation - testing deployed token", async function () {
    nonce++;
    from = addr2.address;
    to = addr4.address;
    amount = 1;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    myTokenOne.connect(addr2).approve(tokenBridge.address, amount);
    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, amount, nonce, signedMessage))
      .to.emit(tokenBridge, "Bridge")
      .withArgs(from, to, amount, nonce, signedMessage, 0);
  });
  it("RecoverSigner: Should be reverted due to short signature", async function () {
    nonce++;
    from = addr2.address;
    to = addr4.address;
    amount = 1;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    myTokenOne.connect(addr2).approve(tokenBridge.address, amount);
    await expect(tokenBridge.connect(addr2).lock(originalTokenAddress, from, to, amount, nonce, signedMessage.substring(0, 10)))
      .to.be.reverted;
  });
});