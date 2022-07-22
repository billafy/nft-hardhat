const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.js");

module.exports.tags = ["random"];

!developmentChains.includes(network.name)
	? describe.skip
	: describe("RandomIpfsNft", async () => {
			const MINT_FEE = ethers.utils.parseEther("0.1");
			let randomIpfsNft, deployer, vrfCoordinatorV2Mock;

			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture();
				randomIpfsNft = await ethers.getContract("RandomIpfsNft");
				vrfCoordinatorV2Mock = await ethers.getContract(
					"VRFCoordinatorV2Mock"
				);
			});

			describe("constructor", async () => {
				it("sets the deployed account as owner", async () => {
					const owner = await randomIpfsNft.getOwner();
					assert.equal(owner, deployer);
				});

				it("sets the vrfcoordinatorv2 properly", async () => {
					const vrfCoordinatorV2 =
						await randomIpfsNft.getVrfCoordinatorV2();
					assert.equal(
						vrfCoordinatorV2,
						vrfCoordinatorV2Mock.address
					);
				});

				it("sets the mint fee correctly", async () => {
					const mintFee = await randomIpfsNft.getMintFee();
					assert.equal(mintFee.toString(), MINT_FEE);
				});

				it("initializes token counter to 0", async () => {
					const tokenCounter = await randomIpfsNft.getTokenCounter();
					assert.equal(tokenCounter.toString(), "0");
				});

				it("adds 3 nfts", async () => {
					const nftTokenUris = await randomIpfsNft.getNftTokenUris();
					assert.equal(nftTokenUris.length, 3);
				});
			});

			describe("request nft", async () => {
				it("reverts when mint fee is less than required", async () => {
					await expect(
						randomIpfsNft.requestNft({
							value: ethers.utils.parseEther("0.05"),
						})
					).to.be.revertedWith("RandomIpfsNft__NeedMoreETH()");
				});

				it("emits an event", async () => {
					await expect(
						randomIpfsNft.requestNft({ value: MINT_FEE })
					).to.emit(randomIpfsNft, "NftRequested");
				});

				it("maps sender address to the vrf coordinator request id", async () => {
					const txn = await randomIpfsNft.requestNft({
						value: MINT_FEE,
					});
					const txnReceipt = await txn.wait(1);
					const requestId = txnReceipt.events[1].args.requestId;
					const sender = await randomIpfsNft.getSenderFromRequestId(
						requestId
					);
					assert.equal(sender, deployer);
				});
			});

			describe("fulfill random words", () => {
				it("mints a new nft", async () => {
					await new Promise(async (resolve, reject) => {
						randomIpfsNft.once("NftMinted", async () => {
							console.log("minted");
							try {
								const tokenUri = await randomIpfsNft.tokenURI(
									"0"
								);
								const tokenCounter =
									await randomIpfsNft.getTokenCounter();
								assert(tokenUri.toString().includes("ipfs://"));
								assert.equal(tokenCounter.toString(), "1");
								resolve();
							} catch (error) {
								reject(error);
							}
						});
						try {
							const txn = await randomIpfsNft.requestNft({
								value: MINT_FEE,
							});
							const txnReceipt = await txn.wait(1);
							await vrfCoordinatorV2Mock.fulfillRandomWords(
								txnReceipt.events[1].args.requestId,
								randomIpfsNft.address
							);
						} catch (error) {
							reject(error);
						}
					});
				});
			});

			describe("withdraw", async () => {
				it("blocks any non-owner account", async () => {
					const accounts = await ethers.getSigners();
					const connectedRandomIpfsNft = await randomIpfsNft.connect(
						accounts[1]
					);
					await expect(
						connectedRandomIpfsNft.withdraw()
					).to.be.revertedWith("RandomIpfsNft__NotOwner()");
				});
			});
	  });
