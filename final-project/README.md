```shell
Open new terminal:
npx hardhat node

Open new terminal:
npx hardhat deploy-erc20-contracts --network localhost
npx hardhat deploy-bridges --network localhost
npx hardhat run scripts/event-listener.js

Open new terminal:
npx hardhat lock --network localhost  0x663F3ad617193148711d28f5334eE4Ed07016602 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 5 1

npx hardhat claim --network localhost 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 5 2

npx hardhat burn --network localhost 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 5 3

npx hardhat release --network localhost 0x663F3ad617193148711d28f5334eE4Ed07016602 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC 5 4
```
