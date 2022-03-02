pragma solidity >=0.4.2 <0.9.0;

contract MyToken {
  // constructor
  // set the total number of tokens
  // read the total number of tokens
  uint256 public totalSupply;

  constructor() {
    totalSupply = 1000000;
  }
}