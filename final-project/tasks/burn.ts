import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";
import { task } from "hardhat/config";

task("burn", "Burns amount that is bridged")
    .addPositionalParam("from")
    .addPositionalParam("to")
    .addPositionalParam("amount")
    .addPositionalParam("nonce")
    .setAction(
        async (_args, { ethers, run }) => {
            const hre = require("hardhat");

            const from = _args.from;
            const to = _args.to;
            const amount = _args.amount;
            const nonce = _args.nonce;

            await hre.run('print', { message: `Parameters: ${from}, ${to}, ${amount}, ${nonce}` });

            let messageHash = ethers.utils.solidityKeccak256(
                ['address', 'address', 'uint256', 'uint256'],
                [from, to, 0, nonce]);
            let arrayfiedHash = ethers.utils.arrayify(messageHash);
            let signedMessage = await from.signMessage(arrayfiedHash);

            await hre.run('print', { message: `Signed message: ${signedMessage}` });


            // await expect(sideTokenBridge.connect(addr4).claim(from, to, 0, nonce, signedMessage))

            // await hre.run('print', { message: `The Token Bridge contract is deployed to ${tokenBridge.address}` })

            // const TokenBridgeSide_Factory = await ethers.getContractFactory("SideTokenBridge");
            // const tokenBridgeSide = await TokenBridgeSide_Factory.deploy();
            // await tokenBridgeSide.deployed();

            // await hre.run('print', { message: `The Token Bridge Side contract is deployed to ${tokenBridgeSide.address}` })
        }
    );