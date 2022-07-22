// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';

import 'base64-sol/base64.sol';

contract DynamicSvgNft is ERC721 {
	uint256 private s_tokenCounter;
	string private immutable i_lowSvg;
	string private immutable i_highSvg;
	string private constant BASE_64_PREFIX = "data:image/svg+xml;base64,"

	constructor(string memory lowSvg, string memory highSvg) ERC721("Dynamic", "DYN") {
		s_tokenCounter = 0;
	}

	function svgToImageUri(string memory svg) public pure returns (string memory) {
		string memory encoded = Base64.encode(bytes(string(abi.encodePacked(svg))))
		return string(abi.encodePacked(BASE_64_PREFIX, encoded));
	}

	function mintNft() public {
		_safeMint(msg.sender, s_tokenCounter);
		++s_tokenCounter;
	}
}