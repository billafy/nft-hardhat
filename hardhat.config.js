require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
require("hardhat-deploy");
require("dotenv").config();

const RINKEBY_RPC_URL =
	process.env.RINKEBY_RPC_URL || "https://eth-rinkeby.alchemyapi.io/v2/123";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "123";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "123";

module.exports = {
	solidity: "0.8.9",
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 31337,
			blockConfirmations: 1,
		},
		rinkeby: {
			chainId: 4,
			blockConfirmations: 6,
			url: RINKEBY_RPC_URL,
			accounts: [PRIVATE_KEY],
		},

	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
	},
};
