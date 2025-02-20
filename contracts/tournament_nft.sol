// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TournamentLevelNft is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    //Mapping tokenId to type of Battle
    mapping(uint256 => string) public BattleType;
    mapping(uint256 => address) public NFTOwner;

    event NFTminted(address player,uint256 tokenId);

    constructor() ERC721("BattleKey","BTK") Ownable(msg.sender) {
        tokenCounter = 1;
    }


    function mintTournamentNFT(
        string memory Type,
        string memory tokenURI
    ) external {
        require(msg.sender != address(0),"not a valid sender");


        uint256 newTokenId = tokenCounter;
        NFTOwner[newTokenId] = msg.sender;
        BattleType[newTokenId] = Type;
        _mint(msg.sender,newTokenId);
        _setTokenURI(newTokenId,tokenURI);
        tokenCounter++;
        emit NFTminted(msg.sender,newTokenId);
    }
}