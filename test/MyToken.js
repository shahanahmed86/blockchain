const MyToken = artifacts.require('MyToken');

contract('MyToken', (accounts) => {
  it ('sets the total supply upon deployment', () => {
    return MyToken.deployed().then(instance => {
      tokenInstance = instance;
      return tokenInstance.totalSupply();
    }).then(totalSupply => {
      assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to one million');
    })
  })
})