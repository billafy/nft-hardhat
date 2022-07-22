const { ethers, network } = require("hardhat");
const {
	networkConfig,
	developmentChains,
	SUBSCRIPTION_ID,
	BASE_FEE,
	GAS_PRICE_LINK,
} = require("../helper-hardhat.config");
const verify = require("../utils/verify");
const {storeImages} = require('../utils/uploadToNftStorage');
const fs = require('fs');

const getTokenUris = async () => {
	const tokenUris = await storeImages('./images');
	return tokenUris.length === 3 ? tokenUris : ['', '', ''];
};

module.exports = async ({ deployments, getNamedAccounts }) => {
	/* deploy deploys the contract, log is just console.log */
	const { deploy, log } = deployments;
	/* gets the account through which the contract will be deployed */
	const { deployer } = await getNamedAccounts();
	/* chain id of the network */
	const chainId = network.config.chainId;

	let tokenUris;
	try {
		const data = fs.readFileSync('./tokenUris.json', {encoding: 'utf8'})
		tokenUris = JSON.parse(data);
	} catch (error) {
		tokenUris = await getTokenUris();
		console.log(tokenUris);
		fs.writeFileSync('./tokenUris.json', JSON.stringify(tokenUris));
	}

	/* if it is a development server, deploy mocks */
	let vrfCoordinatorV2Address, subscriptionId;
	if (developmentChains.includes(network.name)) {
		await deploy("VRFCoordinatorV2Mock", {
			from: deployer,
			log: true,
			args: [BASE_FEE, GAS_PRICE_LINK],
		});
		const vrfCoordinatorV2Mock = await ethers.getContract('VRFCoordinatorV2Mock');
		vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
		const txnResponse = await vrfCoordinatorV2Mock.createSubscription();
		const txnReceipt = await txnResponse.wait(1);
		subscriptionId = txnReceipt.events[0].args.subId;
		await vrfCoordinatorV2Mock.fundSubscription(
			subscriptionId,
			ethers.utils.parseEther("2")
		);
	} else {
		vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
		subscriptionId = SUBSCRIPTION_ID;
	}
	/* or use chainlink address */

	/* deploy randomIpfsNft contract */
	const args = [
		tokenUris,
		ethers.utils.parseEther('0.1'),
		vrfCoordinatorV2Address,
		subscriptionId,
		networkConfig[chainId].keyHash,
		networkConfig[chainId].callbackGasLimit,
	];

	const randomIpfsNft = await deploy("RandomIpfsNft", {
		from: deployer,
		args: args,
		waitConfirmations: network.config.blockConfirmations || 1,
		log: true,
	});

	/* verify it on etherscan */
	const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
	if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY)
		await verify(randomIpfsNft.address, args);
};

module.exports.tags = ['random'];