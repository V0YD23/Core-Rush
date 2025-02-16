// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GameLevelNFTRental is ReentrancyGuard, Ownable(msg.sender) {
    struct RentalListing {
        address owner;
        address renter;
        uint256 pricePerHour;
        uint256 rentalExpiry;
        bool isListed;
    }

    IERC721 public immutable nftContract;
    mapping(uint256 => RentalListing) public rentalListings;

    event NFTListedForRent(uint256 indexed tokenId, address indexed owner, uint256 pricePerHour);
    event NFTUnlisted(uint256 indexed tokenId, address indexed owner);
    event NFTRented(uint256 indexed tokenId, address indexed renter, uint256 expiryTime);

    constructor(address _nftContract) {
        require(_nftContract != address(0), "Invalid contract address");
        nftContract = IERC721(_nftContract);
    }

    function listNFTForRent(uint256 tokenId, uint256 pricePerHour) external {
        require(nftContract.ownerOf(tokenId) == msg.sender, "You are not the owner");
        require(pricePerHour > 0, "Price must be greater than zero");
        require(nftContract.getApproved(tokenId) == address(this) || nftContract.isApprovedForAll(msg.sender, address(this)), 
            "Contract is not approved to transfer NFT");

        rentalListings[tokenId] = RentalListing({
            owner: msg.sender,
            renter: address(0),
            pricePerHour: pricePerHour,
            rentalExpiry: 0,
            isListed: true
        });

        emit NFTListedForRent(tokenId, msg.sender, pricePerHour);
    }

    function unlistNFT(uint256 tokenId) external {
        require(rentalListings[tokenId].owner == msg.sender, "You are not the owner");
        require(rentalListings[tokenId].isListed, "NFT is not listed");

        rentalListings[tokenId].isListed = false;
        emit NFTUnlisted(tokenId, msg.sender);
    }

    function rentNFT(uint256 tokenId, uint256 hoursRequested) external payable nonReentrant {
        RentalListing storage listing = rentalListings[tokenId];

        require(listing.isListed, "NFT is not listed for rent");
        require(hoursRequested > 0, "Must rent for at least 1 hour");
        require(listing.renter == address(0) || block.timestamp > listing.rentalExpiry, "NFT is currently rented");

        uint256 totalCost = listing.pricePerHour * hoursRequested;
        require(msg.value >= totalCost, "Insufficient payment");

        // Transfer payment to the owner
        (bool success, ) = payable(listing.owner).call{value: totalCost}("");
        require(success, "Payment transfer failed");

        // Transfer NFT to renter
        nftContract.safeTransferFrom(listing.owner, msg.sender, tokenId);

        // Set rental details
        listing.renter = msg.sender;
        listing.rentalExpiry = block.timestamp + (hoursRequested * 1 hours);

        emit NFTRented(tokenId, msg.sender, listing.rentalExpiry);
    }

    function reclaimNFT(uint256 tokenId) external {
        RentalListing storage listing = rentalListings[tokenId];

        require(block.timestamp > listing.rentalExpiry, "Rental period not over yet");
        require(listing.owner == msg.sender, "Only the owner can reclaim");

        // Transfer NFT back to the owner
        nftContract.safeTransferFrom(listing.renter, msg.sender, tokenId);

        // Reset rental details
        listing.renter = address(0);
        listing.rentalExpiry = 0;
        listing.isListed = false;

        emit NFTUnlisted(tokenId, msg.sender);
    }
}
