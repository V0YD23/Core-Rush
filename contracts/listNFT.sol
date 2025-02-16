// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LevelNFT {
    struct RentalListing {
        address owner;
        uint256 pricePerHour;
        bool isActive;
    }

    mapping(uint256 => RentalListing) public rentalListings;

    event NFTListedForRent(address indexed owner, uint256 tokenId, uint256 pricePerHour);
    event NFTUnlisted(uint256 tokenId);

    function listNFTForRent(uint256 tokenId, uint256 pricePerHour) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(pricePerHour > 0, "Price must be greater than zero");

        rentalListings[tokenId] = RentalListing({ owner: msg.sender, pricePerHour: pricePerHour, isActive: true });

        emit NFTListedForRent(msg.sender, tokenId, pricePerHour);
    }

    function unlistNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "You are not the owner");

        rentalListings[tokenId].isActive = false;

        emit NFTUnlisted(tokenId);
    }

    function getActiveListings() external view returns (uint256[] memory, address[] memory, uint256[] memory) {
        uint256 totalSupply = totalSupply();
        uint256 count = 0;

        // Count active listings
        for (uint256 i = 0; i < totalSupply; i++) {
            if (rentalListings[i].isActive) {
                count++;
            }
        }

        uint256[] memory tokenIds = new uint256[](count);
        address[] memory owners = new address[](count);
        uint256[] memory prices = new uint256[](count);

        uint256 index = 0;
        for (uint256 i = 0; i < totalSupply; i++) {
            if (rentalListings[i].isActive) {
                tokenIds[index] = i;
                owners[index] = rentalListings[i].owner;
                prices[index] = rentalListings[i].pricePerHour;
                index++;
            }
        }

        return (tokenIds, owners, prices);
    }
}
