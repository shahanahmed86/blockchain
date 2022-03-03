// SPDX-License-Identifier: MIT
pragma solidity >=0.4.2 <0.9.0;

import "./MyToken.sol";

contract MyTokenSale {
    address admin;
    MyToken public tokenContract;
    uint256 public tokenPrice;

    constructor(MyToken _tokenContract, uint256 _tokenPrice) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }
}
