import { task } from "hardhat/config";
import { signMessage } from "./helper/sign-message";
import { getAvailableAmount } from "./helper/get-available-amount";
import * as util from "util";
import { Step } from "./helper/Step";

task("claim", "Claims amount that is bridged")
    .addPositionalParam("from")
    .addPositionalParam("to")
    .addPositionalParam("amount")
    .addPositionalParam("nonce")
    .setAction(
        async (_args, { ethers, run }) => {
            const hre = require("hardhat");

            const { from, to, amount, nonce } = _args;

            const signer = await ethers.getSigner(from);
            const signedMessage = await signMessage(signer, to, amount, nonce, ethers);

            const sideTokenBridgeAddress = hre.config.deployed_contracts.side_token_bridge_address;
            const sideTokenBridge = await hre.ethers.getContractAt("SideTokenBridge", sideTokenBridgeAddress);

            // const availableAmount =
            //     await getAvailableAmount(hre.config.bridge_api.url + util.format(hre.config.bridge_api.endpoints.getLockedTokensAmount, from, to), Step.Claim);

            // if (availableAmount < amount) {
            //     console.log("Current locked amount is %s, you are trying to claim %s", availableAmount, amount);
            //     return;
            // }

            try {
                await sideTokenBridge.connect(signer).claim(from, to, amount, nonce, signedMessage);
            }
            catch (e) {
                console.log(e.reason);
            }
        }
    );