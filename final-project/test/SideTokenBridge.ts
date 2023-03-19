import { expect } from "chai";
import { ethers } from "hardhat";
import { SideTokenBridge } from "../typechain-types/contracts/Bridges/SideTokenBridge";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("SideTokenBridge", function () {

  let sideTokenBridgeFactory;
  let sideTokenBridge: SideTokenBridge;

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

    sideTokenBridgeFactory = await ethers.getContractFactory("SideTokenBridge");
    sideTokenBridge = await sideTokenBridgeFactory.deploy();
    await sideTokenBridge.deployed();
  });

  it("Claim: Should be rejected with - amount must be above 0", async function () {
    from = addr2.address;
    to = addr4.address;
    
    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, 0, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(sideTokenBridge.connect(addr4).claim(from, to, 0, nonce, signedMessage))
    .to.be.rejectedWith('amount must be above 0');
  });
  it("Claim: Should be rejected with - wrong signature", async function () {
    amount = 2;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(sideTokenBridge.connect(addr4).claim(from, to, 5, nonce, signedMessage))
      .to.be.rejectedWith('wrong signature');
  });
  it("Claim: Should emit Bridge event for Claim operation", async function () {
    await expect(sideTokenBridge.connect(addr4).claim(from, to, amount, nonce, signedMessage))
      .to.emit(sideTokenBridge, "Bridge")
      .withArgs(from, to, amount, nonce, signedMessage, 1);
  });
  it("Claim: Should be rejected with - this transaction has already been processed", async function () {
    await expect(sideTokenBridge.connect(addr4).claim(from, to, amount, nonce, signedMessage))
      .to.be.rejectedWith('this transaction has already been processed');
  });
  it("Claim: Should validate wrapped token balance by sender", async function () {

    await expect(await sideTokenBridge.getSideTokenBalance(addr4.address)).to.equal(amount);
  });

 
  it("Claim: Should be rejected with - amount must be above 0", async function () {
    from = addr4.address;
    to = addr2.address;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, 0, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr2.signMessage(arrayfiedHash);

    await expect(sideTokenBridge.connect(addr4).burn(from, to, 0, nonce, signedMessage))
    .to.be.rejectedWith('amount must be above 0');
  });
  it("Burn: Should be rejected with - wrong signature", async function () {
    amount = 2;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr4.signMessage(arrayfiedHash);

    await expect(sideTokenBridge.connect(addr4).burn(from, to, 5, nonce, signedMessage))
      .to.be.rejectedWith('wrong signature');
  });
  it("Burn: Should emit Bridge event for Burn operation", async function () {
    await expect(sideTokenBridge.connect(addr4).burn(from, to, amount, nonce, signedMessage))
      .to.emit(sideTokenBridge, "Bridge")
      .withArgs(from, to, amount, nonce, signedMessage, 2);
  });
  it("Burn: Should be rejected with - this transaction has already been processed", async function () {
    await expect(sideTokenBridge.connect(addr4).burn(from, to, amount, nonce, signedMessage))
      .to.be.rejectedWith('this transaction has already been processed');
  });
  it("Burn: Should validate wrapped token balance by sender", async function () {

    await expect(await sideTokenBridge.getSideTokenBalance(addr4.address)).to.equal(0);
  });
  it("Burn: Should be rejected with - ERC20: burn amount exceeds balance", async function () {
    nonce++;

    messageHash = ethers.utils.solidityKeccak256(
      ['address', 'address', 'uint256', 'uint256'],
      [from, to, amount, nonce]);
    arrayfiedHash = ethers.utils.arrayify(messageHash);
    signedMessage = await addr4.signMessage(arrayfiedHash);

    await expect(sideTokenBridge.connect(addr4).burn(from, to, amount, nonce, signedMessage))
      .to.be.rejectedWith('ERC20: burn amount exceeds balance');
  });

});