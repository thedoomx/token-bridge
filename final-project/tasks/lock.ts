import { task } from "hardhat/config";
import { getNonce } from "./helper/get-nonce";
import { signMessage } from "./helper/sign-message";

task("lock", "Locks amount to be bridged")
    .addPositionalParam("originalToken")
    .addPositionalParam("from")
    .addPositionalParam("to")
    .addPositionalParam("amount")
    .setAction(
        async (_args, { ethers, run }) => {
            const hre = require("hardhat");

            const { originalToken, from, to, amount } = _args;
            const nonce = await getNonce(ethers, from);

            const signer = await ethers.getSigner(from);
            const signedMessage = await signMessage(signer, to, amount, nonce, ethers);

            const tokenBridgeAddress = hre.config.deployed_contracts.token_bridge_address;

            const tokenBridge = await hre.ethers.getContractAt("TokenBridge", tokenBridgeAddress);
            const myTokenOne = await hre.ethers.getContractAt("MyTokenOne", originalToken);

            try {
                await myTokenOne.connect(signer).approve(tokenBridge.address, amount);
                await tokenBridge.connect(signer).lock(originalToken, from, to, amount, nonce, signedMessage);
            }
            catch (e) {
                console.log(e.reason);
            }
        }
    );