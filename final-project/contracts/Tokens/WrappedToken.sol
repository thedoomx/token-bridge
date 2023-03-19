// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./TokenBase.sol";

contract WrappedToken is TokenBase {
    constructor(address originalTokenAddress) TokenBase("Wrapped Token", "WT") {
        _originalTokenAddress = originalTokenAddress;
    }

    address private _originalTokenAddress;

    function getOriginalTokenAddress() public view returns(address) {
        return _originalTokenAddress;
    }
}
