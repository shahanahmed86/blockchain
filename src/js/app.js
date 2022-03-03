App = {
	loading: false,
	web3Provider: null,
	contracts: {},
	account: '0x0',
	tokenPrice: 1000000000000000,
	tokensSold: 0,
	tokensAvailable: 750000,

	init: () => {
		console.log('App initialized...');
		return App.initWeb3();
	},

	initWeb3: () => {
		if (typeof web3 !== 'undefined') {
			// If a web3 instance is already provided by Meta Mask.
			App.web3Provider = ethereum;
			web3 = new Web3(ethereum);
		} else {
			// Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContracts();
	},

	initContracts: () => {
		$.getJSON('MyTokenSale.json', function (myTokenSale) {
			App.contracts.MyTokenSale = TruffleContract(myTokenSale);
			App.contracts.MyTokenSale.setProvider(App.web3Provider);

			App.contracts.MyTokenSale.deployed().then((instance) => {
				console.log('My Token Sale Address:', instance.address);
			});
		}).done(function () {
			$.getJSON('MyToken.json', function (myToken) {
				App.contracts.MyToken = TruffleContract(myToken);
				App.contracts.MyToken.setProvider(App.web3Provider);

				App.contracts.MyToken.deployed().then((instance) => {
					console.log('My Token Address:', instance.address);

					App.listenToEvents();

					return App.render();
				});
			});
		});
	},

	listenToEvents: () => {
		App.contracts.MyTokenSale.deployed().then((instance) => {
			instance
				.Sell(
					{},
					{
						fromBlock: 0,
						toBlock: 'latest'
					}
				)
				.watch(function (error, event) {
					console.log(event);
					App.render();
				});
		});
	},

	render: function () {
		if (App.loading) return;

		App.loading = true;

		const loader = $('#loader');
		const content = $('#content');

		loader.show();
		content.hide();

		web3.eth.getCoinbase((err, account) => {
			if (err) console.log('getCoinbase error', err.message);
			else if (account) {
				App.account = account;

				let myTokenInstance;
				let myTokenSaleInstance;
				App.contracts.MyTokenSale.deployed()
					.then((instance) => {
						myTokenSaleInstance = instance;
						return myTokenSaleInstance.tokenPrice();
					})
					.then((price) => {
						App.tokenPrice = price;

						$('.token-price').html(web3.fromWei(App.tokenPrice, 'ether').toNumber());
						return myTokenSaleInstance.tokenSold();
					})
					.then((tokensSold) => {
						App.tokensSold = tokensSold.toNumber();
						$('.token-sold').html(App.tokensSold);
						$('.tokens-available').html(App.tokensAvailable);

						const progress = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
						$('#progress').css('width', progress + '%');

						App.contracts.MyToken.deployed()
							.then((instance) => {
								myTokenInstance = instance;
								return myTokenInstance.balanceOf(App.account);
							})
							.then((balance) => {
								$('.my-balance').html(balance.toNumber());

								App.loading = false;

								loader.hide();
								content.show();
							});
					});
			}
		});
	},

	buyTokens: function () {
		$('#content').hide();
		$('#loader').show();

		const numberOfTokens = $('#numberOfTokens').val();

		let myTokenSaleInstance;

		App.contracts.MyTokenSale.deployed()
			.then((instance) => {
				myTokenSaleInstance = instance;

				return myTokenSaleInstance.buyTokens(numberOfTokens, {
					from: App.account,
					value: numberOfTokens * App.tokenPrice,
					gas: 500000
				});
			})
			.then((result) => {
				console.log('Token bought...', result);

				$('.form').trigger('reset');
			})
			.catch((err) => {
				console.log('err.message....', err.message);
			})
			.finally(() => {
				$('#content').show();
				$('#loader').hide();
			});
	}
};

$(() => {
	$(window).load(() => {
		App.init();
	});
});
