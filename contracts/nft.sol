// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameLevelNFT is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;
    // Mapping to track levels completed by each player
    mapping(address => mapping(uint256 => bool)) public hasCompletedLevel;

    event NFTminted(address player, uint256 level, uint256 tokenId);

    constructor() ERC721("GameLevel", "GLV") Ownable(msg.sender) {
        tokenCounter = 1;
    }

    //mint an NFT

    function mintLevelNFT(
        address player,
        uint256 level,
        string memory tokenURI
    ) external {
        require(
            !hasCompletedLevel[player][level],
            "You already own this level NFT"
        );

        hasCompletedLevel[player][level] = true;

        //mintNFT

        uint256 newTokenId = tokenCounter;
        _mint(player, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        tokenCounter++;

        emit NFTminted(player, level, newTokenId);
    }

    function getOwnedNFTs(address player)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = 0;

        // Count NFTs owned by `player`
        for (uint256 i = 1; i < tokenCounter; i++) {
            if (ownerOf(i) == player) {
                count++;
            }
        }

        // Create an array with the correct size
        uint256[] memory ownedTokens = new uint256[](count);
        uint256 index = 0;

        // Populate the array
        for (uint256 i = 1; i < tokenCounter; i++) {
            if (ownerOf(i) == player) {
                ownedTokens[index] = i;
                index++;
            }
        }

        return ownedTokens;
    }
}
