// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./TokenBridgeBase.sol";
import "../Tokens/WrappedToken.sol";

contract TokenBridge is TokenBridgeBase {
    mapping(address => WrappedToken) private _orignalTokenContracts;

    function getWrappedTokenBalance(
        address originalTokenAddress,
        address from
    ) public view returns (uint256) {
        WrappedToken token = _orignalTokenContracts[originalTokenAddress];

        return token.balanceOf(from);
    }

    function lock(
        address originalTokenAddress,
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    )
        external
        requireAmountAboveZero(amount)
        validateProcessedSignature(signature)
        validateSigner(Signer(from, to, amount, nonce, signature))
    {
        IERC20 originalToken = IERC20(originalTokenAddress);
        require(originalToken.balanceOf(from) >= amount, "insufficient assets");

        bool isTransferSuccessful = originalToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(isTransferSuccessful);

        WrappedToken token = _getWrappedToken(originalTokenAddress);

        token.mint(from, amount);

        emit Bridge(from, to, amount, nonce, signature, Step.Lock);
    }

    function release(
        address originalTokenAddress,
        address from, // his wallet address on side network
        address to, // his address on this network
        uint256 amount,
        uint256 nonce,
        bytes calldata signature
    )
        external
        requireAmountAboveZero(amount)
        validateProcessedSignature(signature)
        validateSigner(Signer(from, to, amount, nonce, signature))
    {
        _orignalTokenContracts[originalTokenAddress].burn(to, amount);

        IERC20 originalToken = IERC20(originalTokenAddress);
        bool isTransferSuccessful = originalToken.transfer(to, amount);
        require(isTransferSuccessful);

        emit Bridge(from, to, amount, nonce, signature, Step.Release);
    }

    function _getWrappedToken(
        address originalTokenAddress
    ) private returns (WrappedToken) {
        WrappedToken token = _orignalTokenContracts[originalTokenAddress];

        if (address(token) == address(0)) {
            _deployWrappedToken(originalTokenAddress);
            token = _orignalTokenContracts[originalTokenAddress];
        }

        return token;
    }

    function _deployWrappedToken(address originalTokenAddress) private {
        WrappedToken wrappedToken = new WrappedToken(originalTokenAddress);
        _orignalTokenContracts[originalTokenAddress] = wrappedToken;
    }
}
