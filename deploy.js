const HDWalletProvider = require('@truffle/hdwallet-provider');
const { Web3 } = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  'horror list regular minimum glide cactus jump toast proud rally program city',
  // remember to change this to your own phrase!
  'https://sepolia.infura.io/v3/6be043db54c049d2be9b40f5273d4d25'
  // remember to change this to your own endpoint!
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(interface);
  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
