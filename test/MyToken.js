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
			await instance.transfer.call(to, 99999999999999999999999);
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

	it('approves tokens for  delegated transfer', async () => {
		const instance = await MyToken.deployed();

		const success = await instance.approve.call(to, 100);
		assert.equal(success, true, 'it returns true');

		const receipt = await instance.approve(to, 100, { from });
		assert.equal(receipt.logs.length, 1, 'triggers one event');
		assert.equal(receipt.logs[0].event, 'Approval', 'should be the Approval event');
		assert.equal(receipt.logs[0].args._owner, from, 'logs the account the tokens are authorized by');
		assert.equal(receipt.logs[0].args._spender, to, 'logs the account the tokens are authorized to');
		assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');

		const allowance = await instance.allowance(from, to);
		assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
	});

	it('handles delegated token transfers', async () => {
		const fromAccount = accounts[2];
		const toAccount = accounts[3];
		const spendingAccount = accounts[4];

		const instance = await MyToken.deployed();
		try {
			await instance.transfer(fromAccount, 100, { from });

			await instance.approve(spendingAccount, 10, { from: fromAccount });

			await instance
				.transferFrom(fromAccount, toAccount, 9999, { from: spendingAccount })
				.then((receipt) => receipt.toNumber());
		} catch (error) {
			assert(error.message.indexOf('revert') !== -1, 'cannot transfer value larger than balance');

			try {
				await instance
					.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount })
					.then((receipt) => receipt.toNumber());
			} catch (error) {
				assert(error.message.indexOf('revert') !== -1, 'cannot transfer value larger than approved amount');

				const success = await instance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
				assert.equal(success, true, 'it returns true');

        const receipt = await instance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
        assert.equal(receipt.logs.length, 1, 'triggers one event');
        assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
        assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred by');
        assert.equal(receipt.logs[0].args._to, toAccount, '100 the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');

        const fromBalance = await instance.balanceOf(fromAccount);
        assert.equal(fromBalance.toNumber(), 90, 'deducts the amount from the sending account');

        const toBalance = await instance.balanceOf(toAccount);
        assert.equal(toBalance.toNumber(), 10, 'adds the amount to the receiving account');

        const allowance = await instance.allowance(fromAccount, spendingAccount);
        assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance');
			}
		}
	});
});
