// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyTokenOne is ERC20 {
    constructor() ERC20("My Token One", "MTO") {
        _mint(msg.sender, 1000);
    }
}
