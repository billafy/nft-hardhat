const { expect, assert } = require("chai");
const { network, ethers, deployments, getNamedAccounts } = require("hardhat");
const { developmentChains, lowSvg, highSvg } = require("../../helper-hardhat.config.js");
const base64 = require('base-64');
// var utf8 = require('utf8');

// const BASE_64_SVG_PREFIX = 'data:image/svg+xml;base64,';

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Dynamic SVG NFT", async () => {
			const THRESHOLD = ethers.utils.parseEther('0.0001');
			let dynamicSvgNft, deployer, mockV3Aggregator;

			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture();
				dynamicSvgNft = await ethers.getContract(
					"DynamicSvgNft",
					deployer
				);
				mockV3Aggregator = await ethers.getContract(
					"MockV3Aggregator",
					deployer
				);
			});

			describe("constructor", async () => {
				it("sets the price feed address correctly", async () => {
					const priceFeedAddress = await dynamicSvgNft.getPriceFeed();
					assert.equal(priceFeedAddress, mockV3Aggregator.address);
				});

				it('sets the low svg uri correctly', async () => {
					const lowSvgURI = await dynamicSvgNft.getLowSvgURI();
					assert.equal(lowSvgURI, await dynamicSvgNft.svgToImageURI(lowSvg));
				});

				it('sets the high svg uri correctly', async () => {
					const highSvgURI = await dynamicSvgNft.getHighSvgURI();
					assert.equal(highSvgURI, await dynamicSvgNft.svgToImageURI(highSvg));
				});

				it('initializes token counter as 0', async () => {
					const tokenCounter = await dynamicSvgNft.getTokenCounter();
					assert.equal(tokenCounter.toString(), '0');
				});
			});

			describe('mint nft', async () => {
				it('updates token counter by 1', async () => {
					await dynamicSvgNft.mintNft(THRESHOLD);
					const tokenCounter = await dynamicSvgNft.getTokenCounter();
					assert.equal(tokenCounter.toString(), '1');
				});

				it('sets the threshold value to the corresponding token id', async () => {
					await dynamicSvgNft.mintNft(THRESHOLD);
					const threshold = await dynamicSvgNft.getThresholdFromTokenId(0);
					assert.equal(threshold.toString(), THRESHOLD);
				});

				it('emits an event', async () => {
					await expect(dynamicSvgNft.mintNft(THRESHOLD)).to.emit(dynamicSvgNft, 'NftMinted');
				});
			});

			describe('token uri', async () => {
				it('reverts when invalid token id is passed', async () => {
					await expect(dynamicSvgNft.tokenURI(1)).to.be.revertedWith('DynamicSvgNft__NonExistentURI()');
				});

				it('returns low svg when price is less than threshold', async () => {
					await dynamicSvgNft.mintNft(THRESHOLD);
					const tokenURI = await dynamicSvgNft.tokenURI(0);
					const metadata = JSON.parse(base64.decode(tokenURI.split(',')[1]));
					const lowSvgURI = await dynamicSvgNft.svgToImageURI(lowSvg);
					assert.equal(metadata.image, lowSvgURI);
				});

				it('returns high svg when price is greater than or equal to threshold', async () => {
					await dynamicSvgNft.mintNft(THRESHOLD);
					await mockV3Aggregator.updateAnswer(200000000000000);
					const tokenURI = await dynamicSvgNft.tokenURI(0);
					const metadata = JSON.parse(base64.decode(tokenURI.split(',')[1]));
					const highSvgURI = await dynamicSvgNft.svgToImageURI(highSvg);
					assert.equal(metadata.image, highSvgURI);
				});
			});
	  });

