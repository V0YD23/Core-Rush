// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameLevelNFT is ERC721URIStorage, Ownable {

    uint public tokenCounter;
    // Mapping to track levels completed by each player
    mapping(address => mapping(uint256 => bool)) public hasCompletedLevel;

    event NFTminted (address player,uint256 level,uint256 tokenId);

    constructor() ERC721('GameLevel','GLV') Ownable(msg.sender){
        tokenCounter = 1;
    }

    //mint an NFT

    function mintLevelNFT(address player,uint256 level,string memory tokenURI) external onlyOwner {
        require(!hasCompletedLevel[player][level], "You already own this level NFT");

        hasCompletedLevel[player][level] = true;

        //mintNFT

        uint256 newTokenId = tokenCounter;
        _mint(player,newTokenId);
        _setTokenURI(newTokenId,tokenURI);

        tokenCounter++;

        emit NFTminted(player,level,newTokenId);
    }
}