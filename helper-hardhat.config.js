const { ethers } = require("hardhat");

const networkConfig = {
	4: {
		name: "rinkeby",
		vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
		keyHash:
			"0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
		callbackGasLimit: 40000,
	},
	31337: {
		name: "hardhat",
		keyHash:
			"0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
		callbackGasLimit: 40000,
	},
};

const SUBSCRIPTION_ID = 4304;
const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 10 ** 9;

const developmentChains = ["hardhat", "localhost"];

module.exports = {
	networkConfig,
	developmentChains,
	SUBSCRIPTION_ID,
	BASE_FEE,
	GAS_PRICE_LINK,
};
