const { network } = require("hardhat");
const verify = require("../utils/verify");
const { developmentChains } = require("../helper-hardhat.config.js");

module.exports = async ({ deployments, getNamedAccounts }) => {
	const { deploy } = deployments;
	const { deployer } = await getNamedAccounts();

	const basicNft = await deploy("BasicNft", {
		from: deployer,
		log: true,
		args: [],
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	)
		await verify(basicNft.address, []);
};

module.exports.tags = ['basic'];