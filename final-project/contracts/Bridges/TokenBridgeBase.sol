// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./RecoverSigner.sol";
import "../Tokens/SideToken.sol";

abstract contract TokenBridgeBase is RecoverSigner {
    address public admin;

    mapping(bytes => bool) internal isSignatureProcessed;

     enum Step {
        Lock,
        Claim,
        Burn,
        Release
    }

    event Bridge(
        address from,
        address to,
        uint256 amount,
        uint256 nonce,
        uint256 timestamp,
        bytes signature,
        Step indexed step
    );

    struct Signer {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
        bytes signature;
    }

    modifier requireAmountAboveZero(uint256 amount) {
        require(
            amount > 0,
            "amount must be above 0"
        );
        _;
    }

    modifier validateProcessedSignature(bytes calldata signature) {
        require(
            isSignatureProcessed[signature] == false,
            "this transaction has already been processed"
        );
        _;
        isSignatureProcessed[signature] = true;
    }

    modifier validateSigner(Signer memory signer) {
        bytes32 message = prefixed(
            keccak256(
                abi.encodePacked(
                    signer.from,
                    signer.to,
                    signer.amount,
                    signer.nonce
                )
            )
        );
        require(
            recoverSigner(message, signer.signature) == signer.from,
            "wrong signature"
        );
        _;
    }

    constructor() {
        admin = msg.sender;
    }
}
