"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { listNFTcontractABI } from "@/abi/listnft.js";
import { NFT } from "@/abi/nft.js";
import Image from "next/image";
import { FaEthereum } from "react-icons/fa";
import { HiClock } from "react-icons/hi";
import { GiMagicSwirl } from "react-icons/gi";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

const NFTcontractAddress: string = process.env.NEXT_PUBLIC_NFT_ADDRESS || "";
const listNFTcontractAddress: string =
  process.env.NEXT_PUBLIC_LIST_NFT_ADDRESS || "";

interface NFT {
  tokenId: number;
  owner: string;
  pricePerHour: string;
  metadata?: {
    name: string;
    description: string;
    image: string;
    attributes: any[];
  };
}

export default function AvailableNFTs() {
  const [availableNFTs, setAvailableNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string | null>(null);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [hoursToRent, setHoursToRent] = useState<number>(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const api = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    loadAvailableNFTs();
  }, []);

  const openRentModal = (nft: NFT) => {
    setSelectedNft(nft);
    setHoursToRent(1);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNft(null);
    setHoursToRent(1);
  };

  async function loadAvailableNFTs() {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to view available NFTs");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const listNFTContract = new ethers.Contract(
        listNFTcontractAddress,
        listNFTcontractABI,
        signer
      );
      const nftContract = new ethers.Contract(NFTcontractAddress, NFT, signer);

      // Get available NFTs from the rental contract
      const [tokenIds, owners, prices] =
        await listNFTContract.getAvailableNFTs();

      // Fetch metadata for each available NFT
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId: bigint, index: number) => {
          try {
            const tokenUri = await nftContract.tokenURI(tokenId);
            const metadata = await fetchMetadata(tokenUri);

            return {
              tokenId: Number(tokenId),
              owner: owners[index],
              pricePerHour: ethers.formatEther(prices[index]),
              metadata,
            };
          } catch (error) {
            console.error(
              `Error fetching metadata for token ${tokenId}:`,
              error
            );
            return {
              tokenId: Number(tokenId),
              owner: owners[index],
              pricePerHour: ethers.formatEther(prices[index]),
            };
          }
        })
      );

      setAvailableNFTs(nftData);
    } catch (error: any) {
      console.error("Error fetching available NFTs:", error);
      toast.error(error.message || "Failed to load available NFTs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata(ipfsUri: string) {
    try {
      const ipfsHash = ipfsUri.replace("ipfs://", "");
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Failed to fetch metadata");

      return await response.json();
    } catch (error) {
      console.error("❌ Error fetching metadata:", error);
      return null;
    }
  }

  async function rentNFT() {
    if (!selectedNft || !window.ethereum) return;

    try {
      setIsSubmitting(true);
      toast.loading("Preparing to rent NFT...");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const listNFTContract = new ethers.Contract(
        listNFTcontractAddress,
        listNFTcontractABI,
        signer
      );
      const nftContract = new ethers.Contract(NFTcontractAddress, NFT, signer);
      // Calculate total cost
      const pricePerHourWei = ethers.parseEther(selectedNft.pricePerHour);
      const totalCost = pricePerHourWei * BigInt(hoursToRent);

      // Call the rentNFT function
      // Fetch original owner before calling rentNFT
      const originalOwner = await nftContract.ownerOf(selectedNft.tokenId);

      const tx = await listNFTContract.rentNFT(
        selectedNft.tokenId,
        hoursToRent,
        {
          value: totalCost,
        }
      );

      toast.loading("Confirming transaction...");
      await tx.wait();

      // Call changeHasCompleted with the original owner
      const change_HasCompleted = await nftContract.changeHasCompleted(
        originalOwner,
        selectedNft.tokenId
      );
      await change_HasCompleted.wait();

      const level = await nftContract.tokenLevel(selectedNft.tokenId);
      const response = await fetch(`${api}/transferred-nft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalOwner_publicKey: originalOwner,
          newOwner_publicKey: account,
          which_level: level,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch proof");

      toast.dismiss();
      toast.success(
        `Successfully rented NFT #${selectedNft.tokenId} for ${hoursToRent} hours!`
      );

      closeModal();
      loadAvailableNFTs(); // Refresh the NFT list
    } catch (error: any) {
      console.error("Error renting NFT:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to rent NFT");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getRarityFromAttributes(attributes: any[]) {
    if (!attributes) return "common";
    const rarityAttr = attributes.find(
      (attr) =>
        attr.trait_type?.toLowerCase() === "rarity" ||
        attr.trait_type?.toLowerCase() === "tier"
    );
    return rarityAttr?.value || "common";
  }

  function getRarityColor(rarity: string) {
    switch (rarity?.toLowerCase()) {
      case "legendary":
        return "text-yellow-400";
      case "epic":
        return "text-purple-500";
      case "rare":
        return "text-blue-500";
      case "uncommon":
        return "text-green-500";
      default:
        return "text-gray-300";
    }
  }

  function getRarityBorder(rarity: string) {
    switch (rarity?.toLowerCase()) {
      case "legendary":
        return "border-yellow-400";
      case "epic":
        return "border-purple-500";
      case "rare":
        return "border-blue-500";
      case "uncommon":
        return "border-green-500";
      default:
        return "border-gray-400";
    }
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
        <motion.h1
  className="text-5xl md:text-6xl font-extrabold text-center mb-4 text-blue-900"
  style={{
    WebkitTextStroke: "2px white", // White border effect
    WebkitTextFillColor: "#1e3a8a", // Dark blue fill
  }}
  initial={{ opacity: 0, y: -20, scale: 0.9 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  transition={{ duration: 0.6, ease: "easeOut" }}
>
  🎮 GAME LEVEL MARKETPLACE
</motion.h1>

          <div className="bg-gray-800 px-4 py-2 rounded-full mt-2 mb-4 flex items-center space-x-2 shadow-lg">
            <div
              className={`w-3 h-3 rounded-full ${
                account ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <p className="text-sm font-mono">
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </p>
          </div>
          <motion.p
            className="text-xl md:text-2xl font-semibold text-center max-w-3xl mx-auto text-[#1E3A8A] drop-shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Rent powerful game levels to advance your journey
          </motion.p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-400 font-semibold">
              Loading available NFTs...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && availableNFTs.length === 0 && (
          <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
            <div className="mb-4 text-6xl">🎲</div>
            <h3 className="text-xl font-bold mb-2">
              No NFTs available for rent
            </h3>
            <p className="text-gray-400 mb-6">
              Check back later or list your own NFTs for rent
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-lg shadow-blue-900/50">
              Explore Quests
            </button>
          </div>
        )}

        {/* NFT Grid */}
        {!loading && availableNFTs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableNFTs.map((nft, index) => {
              const rarity = getRarityFromAttributes(
                nft.metadata?.attributes || []
              );
              const rarityColor = getRarityColor(rarity);
              const rarityBorder = getRarityBorder(rarity);

              return (
                <motion.div
                  key={nft.tokenId}
                  className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${rarityBorder} transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 flex flex-col`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  {/* NFT Image */}
                  <div className="relative min-h-48 bg-gray-900 flex items-center justify-center">
                    {nft.metadata?.image ? (
                      <Image
                        src={nft.metadata.image.replace(
                          "ipfs://",
                          "https://gateway.pinata.cloud/ipfs/"
                        )}
                        alt={nft.metadata?.name || "Game NFT"}
                        layout="fill"
                        objectFit="contain"
                        className="p-2"
                      />
                    ) : (
                      <div className="text-4xl">🎮</div>
                    )}

                    {/* Rarity Badge */}
                    <div
                      className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold uppercase ${rarityColor} bg-gray-900 bg-opacity-70`}
                    >
                      {rarity}
                    </div>

                    {/* Token ID Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-mono bg-black bg-opacity-70">
                      #{nft.tokenId.toString()}
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-1 truncate">
                      {nft.metadata?.name || "Game Level NFT"}
                    </h3>

                    {/* Improved Description */}
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {nft.metadata?.description || "No description available"}
                    </p>

                    {/* Price and Owner Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-blue-300">
                        <FaEthereum className="mr-2" />
                        <span className="font-mono">
                          {nft.pricePerHour} ETH / hour
                        </span>
                      </div>

                      <div className="flex items-center text-blue-200 text-sm truncate">
                        <HiClock className="mr-2 flex-shrink-0" />
                        <span className="truncate">
                          Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
                        </span>
                      </div>
                    </div>

                    {/* Attributes */}
                    {nft.metadata?.attributes && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                        {nft.metadata.attributes
                          ?.filter(
                            (attr: any) =>
                              attr.trait_type?.toLowerCase() !== "rarity" &&
                              attr.trait_type?.toLowerCase() !== "tier"
                          )
                          .slice(0, 4)
                          .map((attr: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-gray-700 bg-opacity-50 px-2 py-1 rounded text-xs"
                            >
                              <span className="text-gray-400">
                                {attr.trait_type}:{" "}
                              </span>
                              <span className="font-medium">{attr.value}</span>
                            </div>
                          ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => openRentModal(nft)}
                      className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 text-sm font-bold shadow-md flex items-center justify-center"
                    >
                      <GiMagicSwirl className="mr-2" /> Rent this Level
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rent Modal */}
      {showModal && selectedNft && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <motion.div
            className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-blue-500"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">
                Rent NFT Level
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative w-16 h-16 bg-gray-900 rounded-md overflow-hidden flex-shrink-0">
                  {selectedNft.metadata?.image ? (
                    <Image
                      src={selectedNft.metadata.image.replace(
                        "ipfs://",
                        "https://gateway.pinata.cloud/ipfs/"
                      )}
                      alt={selectedNft.metadata?.name || "NFT"}
                      layout="fill"
                      objectFit="contain"
                      className="p-1"
                    />
                  ) : (
                    <div className="text-2xl flex items-center justify-center h-full">
                      🎮
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold">
                    {selectedNft.metadata?.name || "Game Level NFT"}
                  </h4>
                  <p className="text-sm text-gray-400">
                    ID: #{selectedNft.tokenId}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Price per hour
                  </label>
                  <div className="flex items-center space-x-2 text-lg font-mono bg-gray-700 border border-gray-600 rounded-md px-3 py-2">
                    <FaEthereum className="text-blue-400" />
                    <span>{selectedNft.pricePerHour} ETH</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Number of hours to rent
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hoursToRent}
                    onChange={(e) =>
                      setHoursToRent(parseInt(e.target.value) || 1)
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-700 rounded-md p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Total cost:</span>
                    <span className="font-mono font-medium text-white">
                      {(
                        parseFloat(selectedNft.pricePerHour) * hoursToRent
                      ).toFixed(6)}{" "}
                      ETH
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    NFT will be returned automatically after the rental period
                    ends
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={rentNFT}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-md transition duration-200 font-medium ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSubmitting ? "Processing..." : "Rent Now"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
