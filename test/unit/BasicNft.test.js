const { assert, expect } = require("chai");
const { ethers, deployments, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat.config.js");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("BasicNft", async () => {
			const TOKEN_URI =
				"https://ipfs.io/ipfs/bafkreic4owxijq2upy2za5uf3d7rg52kali6gxpf3v4eam3t4ry5lthlxe?filename=bhorang.json";
			let basicNft, deployer;

			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture();
				basicNft = await ethers.getContract("BasicNft", deployer);
			});

			describe("constructor", async () => {
				it("initializes the token counter as 0", async () => {
					const tokenCounter = await basicNft.getTokenCounter();
					assert.equal(tokenCounter.toNumber(), 0);
				});
			});

			describe("mint nft", async () => {
				it("increases the token counter by 1", async () => {
					const startTokenCounter = await basicNft.getTokenCounter();
					await basicNft.mintNft();
					const endTokenCounter = await basicNft.getTokenCounter();
					assert.equal(
						startTokenCounter.add(1).toString(),
						endTokenCounter.toString()
					);
				});
			});

			describe("token uri", async () => {
				it("returns the token uri when token id is valid", async () => {
					await basicNft.mintNft();
					const tokenUri = await basicNft.tokenURI(0);
					assert.equal(tokenUri, TOKEN_URI);
				});

				it("reverts when the token id is invalid", async () => {
					await expect(basicNft.tokenURI(0)).to.be.revertedWith(
						"ERC721: Token ID does not exist"
					);
				});
			});
	  });
