const MyToken = artifacts.require('MyToken');
const MyTokenSale = artifacts.require('MyTokenSale');

module.exports = function (deployer) {
  const tokenPrice = 1000000000000000; // in wei, is equal to 0.001
	deployer.deploy(MyTokenSale, MyToken.address, tokenPrice);
};
