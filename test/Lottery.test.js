const ganache = require('ganache');
const { Web3 } = require('web3');
const assert = require('assert');
const web3 = new Web3(ganache.provider());
// updated imports added for convenience

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' })
});

describe('Lottery', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address)
  });

  it('successfully enters an address when enter is called', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('successfully enters in multiple addresses', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  })

  it('requires the minimum amount of ether to enter', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 200
      });
      assert(false)
    } catch (err) {
      assert(err);
    }
  });

  it('restricts the pickWinner method to the manager address', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1],
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('awards ETH pool to winning address and resets player list to zero', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    })

    const initBalance = await web3.eth.getBalance(accounts[0]);

    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const endBalance = await web3.eth.getBalance(accounts[0]);
    const difference = endBalance - initBalance;

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert(difference > web3.utils.toWei('1.8', 'ether'));
    assert.equal(0, players.length);
  });
})