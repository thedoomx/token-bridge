import { task } from "hardhat/config";
import { signMessage } from "./helper/sign-message";
import { getAvailableAmount } from "./helper/get-available-amount";
import * as util from "util";
import { Step } from "./helper/Step";
import { getNonce } from "./helper/get-nonce";

task("burn", "Burns amount that is bridged")
    .addPositionalParam("from")
    .addPositionalParam("to")
    .addPositionalParam("amount")
    .setAction(
        async (_args, { ethers, run }) => {
            const hre = require("hardhat");

            const { from, to, amount } = _args;
            const nonce = await getNonce(ethers, from);

            const signer = await ethers.getSigner(from);
            const signedMessage = await signMessage(signer, to, amount, nonce, ethers);

            const sideTokenBridgeAddress = hre.config.deployed_contracts.side_token_bridge_address;
            const sideTokenBridge = await hre.ethers.getContractAt("SideTokenBridge", sideTokenBridgeAddress);

            // const availableAmount =
            //     await getAvailableAmount(hre.config.bridge_api.url + util.format(hre.config.bridge_api.endpoints.getClaimedTokensAmount, to, from), Step.Burn);
            
            //     if (availableAmount < amount) {
            //     console.log("Current claimed amount is %s, you are trying to burn %s", availableAmount, amount);
            //     return;
            // }
            
            try {
                await sideTokenBridge.connect(signer).burn(from, to, amount, nonce, signedMessage);
            }
            catch (e) {
                console.log(e.reason);
            }
        }
    );
