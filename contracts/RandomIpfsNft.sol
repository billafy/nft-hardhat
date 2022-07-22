// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETH();
error RandomIpfsNft__NotOwner();
error RandomIpfsNft__WithdrawFailed();

contract RandomIpfsNft is ERC721URIStorage, VRFConsumerBaseV2 {
	enum Name {
		SCEPTILE,
		GROVYLE,
		TREECKO
	}

	uint256 private s_tokenCounter;
	string[] internal s_nftTokenUris;
	uint256 private immutable i_mintFee;
	uint256 private constant MAX_CHANCE = 100;

	address private immutable i_owner;

	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    mapping(uint256 => address) private s_requestIdToSender;

    /* events */

    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Name name, address minter);

	constructor(
		string[3] memory nftTokenUris,
		uint256 mintFee,
		address vrfCoordinatorAddress,
		uint64 subscriptionId,
		bytes32 keyHash,
		uint32 callbackGasLimit
	) VRFConsumerBaseV2(vrfCoordinatorAddress) ERC721("Grass", "GRS") {
		i_owner = msg.sender;
		s_nftTokenUris = nftTokenUris;
		s_tokenCounter = 0;
		i_mintFee = mintFee;
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorAddress);
		i_subscriptionId = subscriptionId;
		i_keyHash = keyHash;
		i_callbackGasLimit = callbackGasLimit;
	}

	function requestNft() public payable {
		if(msg.value < i_mintFee) 
			revert RandomIpfsNft__NeedMoreETH();
		uint256 requestId = i_vrfCoordinator.requestRandomWords(
			i_keyHash,
			i_subscriptionId,
			REQUEST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUM_WORDS
		);
		s_requestIdToSender[requestId] = msg.sender;
		emit NftRequested(requestId, msg.sender);
	}

	function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
		address nftOwner = s_requestIdToSender[requestId];

		uint256 randomNumber = randomWords[0] % MAX_CHANCE;
		Name name = getNft(randomNumber);

		uint256 tokenId = s_tokenCounter;
		_safeMint(nftOwner, tokenId);
		_setTokenURI(tokenId, s_nftTokenUris[uint256(name)]);

		++s_tokenCounter;
		emit NftMinted(name, nftOwner);
	}

	modifier onlyOwner {
		if(msg.sender != i_owner) 
			revert RandomIpfsNft__NotOwner();
		_;
	}

	function withdraw() public payable onlyOwner {
		uint256 amount = address(this).balance;
		(bool success, ) = payable(msg.sender).call{value: amount}("");
		if(!success) 
			revert RandomIpfsNft__WithdrawFailed();
	}

	function getNft(uint256 randomNumber) internal pure returns (Name) {
		uint256 sum = 0;
		uint256[3] memory chanceArray = getChanceArray();
		for(uint256 i = 0; i < chanceArray.length; ++i) {
			if(randomNumber >= sum && randomNumber < sum + chanceArray[i]) 
				return Name(i);
			sum += chanceArray[i];
		}
		revert RandomIpfsNft__RangeOutOfBounds();
	}

	function getChanceArray() internal pure returns (uint256[3] memory) {
		return [10, 30, MAX_CHANCE];
	}

	/* views */

	function getMintFee() public view returns (uint256) {
		return i_mintFee;
	}

	function getNftTokenUris() public view returns (string[] memory) {
		return s_nftTokenUris;
	}

	function getTokenCounter() public view returns (uint256) {
		return s_tokenCounter;
	}

	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getSenderFromRequestId(uint256 requestId) public view returns (address) {
		return s_requestIdToSender[requestId];
	}

	function getVrfCoordinatorV2() public view returns (VRFCoordinatorV2Interface) {
		return i_vrfCoordinator;
	}
}