const MyTokenSale = artifacts.require('MyTokenSale');

contract('MyTokenSale', (accounts) => {
	let tokenSaleInstance;
  let tokenPrice = 1000000000000000; // in wei

	it('initializes the contract with the correct values', async () => {
    tokenSaleInstance = await MyTokenSale.deployed();

    const address = tokenSaleInstance.address
    assert.notEqual(address, 0x0, 'has contract address');

    const tokenAddress = await tokenSaleInstance.tokenContract();
    assert.notEqual(tokenAddress, 0x0, 'has token contract address');

    const price = await tokenSaleInstance.tokenPrice();
    assert.equal(price, tokenPrice, 'token price is correct');
  });
});
