import { task } from "hardhat/config";
import { signMessage } from "./helper/sign-message";
import { getAvailableAmount } from "./helper/get-available-amount";
import * as util from "util";

task("release", "Releases amount that is bridged")
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

            const tokenBridgeAddress = hre.config.deployed_contracts.token_bridge_address;

            const tokenBridge = await hre.ethers.getContractAt("TokenBridge", tokenBridgeAddress);

            const availableAmount =
                await getAvailableAmount(hre.config.bridge_api.url + util.format(hre.config.bridge_api.endpoints.getReleasedTokensAmount, to, from));
            if (availableAmount < amount) {
                console.log("Current burned amount is %s, you are trying to release %s", availableAmount, amount);
                return;
            }

            try {
                await tokenBridge.connect(signer).release(originalToken, from, to, amount, nonce, signedMessage);
            }
            catch (e) {
                console.log(e.reason);
            }
        }
    );