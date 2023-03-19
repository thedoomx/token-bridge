// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

abstract contract TokenBase is ERC20 {
  constructor(string memory name, string memory symbol) ERC20(name, symbol) {
  }

  function mint(address to, uint amount) external {
    _mint(to, amount);
  }

  function burn(address owner, uint amount) external {
    _burn(owner, amount);
  }
}