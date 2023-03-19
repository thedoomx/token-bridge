import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

export async function signMessage(signer: SignerWithAddress, to: string, amount: number, nonce: number, ethers: HardhatEthersHelpers) {

    let messageHash = ethers.utils.solidityKeccak256(
        ['address', 'address', 'uint256', 'uint256'],
        [signer.address, to, amount, nonce]);
    let arrayfiedHash = ethers.utils.arrayify(messageHash);
    let signedMessage = await signer.signMessage(arrayfiedHash);


    return signedMessage;
}