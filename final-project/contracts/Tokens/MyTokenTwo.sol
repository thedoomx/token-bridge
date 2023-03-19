// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyTokenTwo is ERC20 {
    constructor() ERC20("My Token Two", "MTT") {
        _mint(msg.sender, 2000);
    }
}
