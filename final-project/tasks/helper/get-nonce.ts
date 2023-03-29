import { HardhatEthersHelpers } from "@nomiclabs/hardhat-ethers/types";

export async function getNonce(ethers: HardhatEthersHelpers, from: string) : Promise<number> {

    return await ethers.provider.getTransactionCount(from, 'latest');
}