// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import 'base64-sol/base64.sol';
import '@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol';

error DynamicSvgNft__NonExistentURI();

contract DynamicSvgNft is ERC721 {
	uint256 private s_tokenCounter;
	string private i_lowSvgURI;
	string private i_highSvgURI;
	string private constant BASE_64_SVG_PREFIX = "data:image/svg+xml;base64,";
	string private constant BASE_64_JSON_PREFIX = "data:application/json;base64,";
	AggregatorV3Interface private immutable i_priceFeed;
	mapping(uint256 => int256) private s_tokenIdToThreshold;

	event NftMinted(uint256 indexed tokenId, int256 threshold);

	constructor(
		string memory lowSvg, 
		string memory highSvg, 
		address aggregatorV3InterfaceAddress
	) ERC721("Dynamic", "DYN") {
		i_lowSvgURI = svgToImageURI(lowSvg);
		i_highSvgURI = svgToImageURI(highSvg);
		i_priceFeed = AggregatorV3Interface(aggregatorV3InterfaceAddress);
		s_tokenCounter = 0;
	}

	function svgToImageURI(string memory svg) public pure returns (string memory) {
		string memory encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
		return string(abi.encodePacked(BASE_64_SVG_PREFIX, encoded));
	}

	function mintNft(int256 threshold) public {
		s_tokenIdToThreshold[s_tokenCounter] = threshold;
		_safeMint(msg.sender, s_tokenCounter);
		emit NftMinted(s_tokenCounter, threshold);
		++s_tokenCounter;
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		if(!_exists(tokenId)) 
			revert DynamicSvgNft__NonExistentURI();
		(, int256 price, , ,) = i_priceFeed.latestRoundData();
		string memory imageURI = i_lowSvgURI;
		if(price >= s_tokenIdToThreshold[tokenId]) 
			imageURI = i_highSvgURI;
		bytes memory metadata = bytes(abi.encodePacked(
			'{"name": "', 
			name(), 
			'", ', 
			'"description": "A Dynamic Nft", "image": "', 
			imageURI, 
			'"}')
		);
		string memory encodedMetadata = Base64.encode(metadata);
		return string(abi.encodePacked(BASE_64_JSON_PREFIX, encodedMetadata));
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getLowSvgURI() public view returns (string memory) {
    	return i_lowSvgURI;
    }

    function getHighSvgURI() public view returns (string memory) {
    	return i_highSvgURI;
    }

    function getTokenCounter() public view returns (uint256) {
    	return s_tokenCounter;
    }

    function getThresholdFromTokenId(uint256 tokenId) public view returns (int256) {
    	return s_tokenIdToThreshold[tokenId];
    }
}