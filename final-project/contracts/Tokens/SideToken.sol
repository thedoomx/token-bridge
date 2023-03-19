// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./TokenBase.sol";

contract SideToken is TokenBase {
    constructor() TokenBase("Side Token", "ST") {
    }
}