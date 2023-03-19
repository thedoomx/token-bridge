import { task } from "hardhat/config";

task("deploy-erc20-contracts", "Deploys ERC20 Contracts").setAction(
  async (_args, { ethers, run }) => {
    const hre = require("hardhat");

    await run("compile");

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const MyTokenOne_Factory = await ethers.getContractFactory("MyTokenOne");
    const tokenOne = await MyTokenOne_Factory.connect(addr2).deploy();
    await tokenOne.deployed();

    await hre.run('print', { message: `The My Token One contract is deployed to ${tokenOne.address} by ${addr2.address}` })

    const MyTokenTwo_Factory = await ethers.getContractFactory("MyTokenTwo");
    const tokenTwo = await MyTokenTwo_Factory.connect(addr3).deploy();
    await tokenTwo.deployed();

    await hre.run('print', { message: `The My Token Two contract is deployed to ${tokenTwo.address} by ${addr3.address}` })
  }
);