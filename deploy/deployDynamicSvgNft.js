const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
    lowSvg,
    highSvg,
} = require("../helper-hardhat.config.js");
const verify = require("../utils/verify");

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy } =
        deployments; /* deploy deploys the contract, log is just console.log */
    const { deployer } =
        await getNamedAccounts(); /* gets the account through which the contract will be deployed */
    const chainId = network.config.chainId; /* chain id of the network */

    /* if it is a development server, deploy mocks */
    let priceFeedAddress = "";
    if (developmentChains.includes(network.name)) {
        const priceFeed = await deploy("MockV3Aggregator", {
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        });
        priceFeedAddress = priceFeed.address;
    } else priceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    /* or use chainlink address */

    /* deploy the contract */
    const args = [lowSvg, highSvg, priceFeedAddress];

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        args,
        from: deployer,
        waitConfirmations: network.config.blockConfirmations || 1,
        log: true,
    });

    /* verify it on etherscan */
    const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
    if (!developmentChains.includes(network.name) && ETHERSCAN_API_KEY)
        verify(dynamicSvgNft.address, args);
};

module.exports.tags = ["dynamic"];
