import { task } from "hardhat/config";
import { signMessage } from "./helper/sign-message";

task("lock", "Locks amount to be bridged")
    .addPositionalParam("originalToken")
    .addPositionalParam("from")
    .addPositionalParam("to")
    .addPositionalParam("amount")
    .addPositionalParam("nonce")
    .setAction(
        async (_args, { ethers, run }) => {
            const hre = require("hardhat");

            const originalToken = _args.originalToken;
            const from = _args.from;
            const to = _args.to;
            const amount = _args.amount;
            const nonce = _args.nonce;

            const signer = await ethers.getSigner(from);
            const signedMessage = await signMessage(signer, to, amount, nonce, ethers);

            const tokenBridgeAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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