// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./TokenBridgeBase.sol";
import "../Tokens/SideToken.sol";

contract SideTokenBridge is TokenBridgeBase {
    SideToken private _token;

    constructor() {
        _token = new SideToken();
    }

    function getSideTokenBalance(address sender) public view returns(uint256) {
        return _token.balanceOf(sender);
    }

    function claim(
        address from, // his wallet address from main network
        address to, // his address on this network
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    )
        external
        requireAmountAboveZero(amount)
        validateProcessedSignature(signature)
        validateSigner(Signer(from, to, amount, nonce, signature))
        returns (uint256)
    {
        _token.mint(to, amount);

        emit Bridge(
            from,
            to,
            amount,
            nonce,
            block.timestamp,
            signature,
            Step.Claim
        );

        return _token.balanceOf(to);
    }

    function burn(
        address from, // his wallet address on this network
        address to, // his address on main network
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    )
        external
        requireAmountAboveZero(amount)
        validateProcessedSignature(signature)
        validateSigner(Signer(from, to, amount, nonce, signature))
    {
        _token.burn(from, amount);

        emit Bridge(
            from,
            to,
            amount,
            nonce,
            block.timestamp,
            signature,
            Step.Burn
        );
    }
}
