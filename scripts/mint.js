const {ethers, getNamedAccounts, deployments} = require('hardhat');

const main = async () => {
	const {deployer} = await getNamedAccounts();

	const basicNft = await ethers.getContract('BasicNft', deployer);
	const txn = await basicNft.mintNft();
	await txn.wait(1);
	console.log(`BasicNFT token URI is ${await basicNft.tokenURI(0)}`);
};

main()
.then(() => process.exit(1))
.catch((err) => {
	console.error(err);
	process.exit(0);
})