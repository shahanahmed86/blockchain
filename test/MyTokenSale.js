const MyToken = artifacts.require('MyToken');
const MyTokenSale = artifacts.require('MyTokenSale');

contract('MyTokenSale', (accounts) => {
	let tokenInstance;
	let tokenSaleInstance;
	let admin = accounts[0];
	let buyer = accounts[1];
	let tokenPrice = 1000000000000000; // in wei
	let tokensAvailable = 750000;
	let numberOfTokens;

	it('initializes the contract with the correct values', async () => {
		tokenSaleInstance = await MyTokenSale.deployed();

		const address = tokenSaleInstance.address;
		assert.notEqual(address, 0x0, 'has contract address');

		const tokenAddress = await tokenSaleInstance.tokenContract();
		assert.notEqual(tokenAddress, 0x0, 'has token contract address');

		const price = await tokenSaleInstance.tokenPrice();
		assert.equal(price, tokenPrice, 'token price is correct');
	});

	it('facilitates token buying', async () => {
		tokenInstance = await MyToken.deployed();
		tokenSaleInstance = await MyTokenSale.deployed();

		const transferReceipt = await tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });

		numberOfTokens = 10;
		const value = numberOfTokens * tokenPrice;

		const receipt = await tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value });
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Sell', 'should be the Sell event');
		assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
		assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the transfer amount');

		const amount = await tokenSaleInstance.tokenSold();
		assert.equal(amount.toNumber(), numberOfTokens, 'increments the number of tokens sold');

		const buyerBalance = await tokenInstance.balanceOf(buyer);
		assert.equal(buyerBalance.toNumber(), numberOfTokens);

		const balance = await tokenInstance.balanceOf(tokenSaleInstance.address);
		assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens);

		try {
			await tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
		} catch (error) {
			assert(error.message.indexOf('revert') !== -1, 'msg.value must equal number of tokens in wei');
		}

		try {
			await tokenSaleInstance.buyTokens(800000, { from: buyer, value });
		} catch (error) {
			assert(error.message.indexOf('revert') !== -1, 'cannot purchase more tokens than available');
		}
	});

	it('ends token sale', async () => {
		tokenInstance = await MyToken.deployed();
		tokenSaleInstance = await MyTokenSale.deployed();

		try {
			await tokenSaleInstance.endSale({ from: buyer });
		} catch (error) {
			assert(error.message.indexOf('revert') !== -1, 'must be admin to end sale');
		}

		try {
			await tokenSaleInstance.endSale({ from: admin });
		} catch (error) {
			assert(error.message.indexOf('revert') !== -1);
		}

		let balance = await tokenInstance.balanceOf(admin);
		assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin');

		balance = await web3.eth.getBalance(tokenSaleInstance.address);
		assert.equal(balance, 0);
	});
});
