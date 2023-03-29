import { task } from "hardhat/config";
import { signMessage } from "./helper/sign-message";
import { getAvailableAmount } from "./helper/get-available-amount";
import * as util from "util";
import { Step } from "./helper/Step";
import { getNonce } from "./helper/get-nonce";

task("release", "Releases amount that is bridged")
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

            // const availableAmount =
            //     await getAvailableAmount(hre.config.bridge_api.url + util.format(hre.config.bridge_api.endpoints.getBurnedTokensAmount, to, from), Step.Release);
            // if (availableAmount < amount) {
            //     console.log("Current burned amount is %s, you are trying to release %s", availableAmount, amount);
            //     return;
            // }

            try {
                await tokenBridge.connect(signer).release(originalToken, from, to, amount, nonce, signedMessage);
            }
            catch (e) {
                console.log(e.reason);
            }
        }
    );