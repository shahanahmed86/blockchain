const MyToken = artifacts.require('MyToken');

contract('MyToken', (accounts) => {
	const to = accounts[1];
	const from = accounts[0];

	it('initializes the contract with the correct value', async () => {
		const instance = await MyToken.deployed();
		const name = await instance.name();
		assert.equal(name, 'My Token', 'has the correct name');

		const symbol = await instance.symbol();
		assert.equal(symbol, 'MY', 'has the correct value');

		const standard = await instance.standard();
		assert.equal(standard, 'My Token v1.0', 'has the correct standard');
	});

	it('allocates the initial supply upon deployment', async () => {
		const instance = await MyToken.deployed();
		const totalSupply = await instance.totalSupply();
		assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to one million');

		const adminBalance = await instance.balanceOf(from);
		assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account');
	});

	it('transfers token ownership', async () => {
		const instance = await MyToken.deployed();
		try {
			const result = await instance.transfer.call(to, 99999999999999999999999);
		} catch (error) {
			assert(error.message.indexOf('overflow') !== -1, 'error message must contain overflow');
			const success = await instance.transfer.call(to, 250000, { from });
      assert.equal(success, true, 'it returns true');

			const receipt = await instance.transfer(to, 250000, { from });
			assert.equal(receipt.logs.length, 1, 'triggers one event');
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
			assert.equal(receipt.logs[0].args._from, from, 'logs the account the tokens are transferred from');
			assert.equal(receipt.logs[0].args._to, to, 'logs the account the tokens are transferred to');
			assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');

			const toBalance = await instance.balanceOf(to);
			assert.equal(toBalance.toNumber(), 250000, 'add the amount to the receiving account');

			const fromBalance = await instance.balanceOf(from);
			assert.equal(fromBalance.toNumber(), 750000, 'deduct the amount from the sending account');


		}
	});
});
