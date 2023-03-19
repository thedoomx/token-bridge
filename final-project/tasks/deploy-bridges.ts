import { task } from "hardhat/config";

task("deploy-bridges", "Deploys Bridge Contracts").setAction(
  async (_args, { ethers, run }) => {
    const hre = require("hardhat");

    await run("compile");

    const TokenBridge_Factory = await ethers.getContractFactory("TokenBridge");
    const tokenBridge = await TokenBridge_Factory.deploy();
    await tokenBridge.deployed();

    await hre.run('print', { message: `The Token Bridge contract is deployed to ${tokenBridge.address}` })

    const TokenBridgeSide_Factory = await ethers.getContractFactory("SideTokenBridge");
    const tokenBridgeSide = await TokenBridgeSide_Factory.deploy();
    await tokenBridgeSide.deployed();

    await hre.run('print', { message: `The Token Bridge Side contract is deployed to ${tokenBridgeSide.address}` })
  }
);