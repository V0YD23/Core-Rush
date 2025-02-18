
"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NFT } from "@/abi/nft.js";
import { listNFTcontractABI } from "@/abi/listnft.js";
import { BrowserProvider, Contract } from "ethers";
import Image from "next/image";
import { toast, Toaster } from 'react-hot-toast';

const NFTcontractAddress = "0xb668133744B73e08EA00DC72295F7e8526279b34";
const listNFTcontractAddress = "0x7a8A1443eEC098Dcd39Ba74a589768ad53021131";

export default function MyNFTs() {
  const [nfts, setNfts] = useState<{ tokenId: number; metadata: any }[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<BrowserProvider>();
  const [contract, setContract] = useState<Contract>();
  const [nftContract, setNftContract] = useState<Contract>();
  const [tokenIdtoRent, setTokenIdtoRent] = useState<number>(0);
  const [pricePerHour, setPricePerHour] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedNft, setSelectedNft] = useState<{ tokenId: number; metadata: any } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const openRentModal = (nft: { tokenId: number; metadata: any }) => {
    setSelectedNft(nft);
    setTokenIdtoRent(nft.tokenId);
    setPricePerHour(0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedNft(null);
    setTokenIdtoRent(0);
    setPricePerHour(0);
  };

  const listForRent = async () => {
    if (!contract || !nftContract) {
      toast.error("Contract not initialized");
      return;
    }

    if (pricePerHour <= 0) {
      toast.error("Please enter a valid price per hour");
      return;
    }

    try {
      setIsSubmitting(true);
      toast.loading("Preparing to list your NFT...");
      
      // Convert price to wei (assuming input is in ETH)
      const priceInWei = ethers.parseEther(pricePerHour.toString());
      
      // First approve the NFT for transfer
      const approveTx = await nftContract.approve(listNFTcontractAddress, tokenIdtoRent);
      toast.loading("Approving NFT transfer...");
      await approveTx.wait();
      
      // Then list it for rent
      const tx = await contract.listNFTForRent(tokenIdtoRent, priceInWei);
      toast.loading("Confirming transaction...");
      await tx.wait();
      
      toast.dismiss();
      toast.success(`NFT #${tokenIdtoRent} listed successfully!`);
      
      closeModal();
      loadNFTs(); // Refresh the NFT list
    } catch (error: any) {
      console.error("Error listing NFT for rent:", error);
      toast.dismiss();
      toast.error(error.message || "Failed to list NFT");
    } finally {
      setIsSubmitting(false);
    }
  };

  async function loadNFTs() {
    if (!window.ethereum) {
      toast.error("Please install MetaMask to view your NFT inventory");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      setProvider(provider);

      const contract = new ethers.Contract(NFTcontractAddress, NFT, signer);
      const listNFTContract = new ethers.Contract(listNFTcontractAddress, listNFTcontractABI, signer);
      setContract(listNFTContract);
      setNftContract(contract);

      // Fetch NFT token IDs owned by the user
      const tokenIds: number[] = await contract.getOwnedNFTs(userAddress);
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId) => {
            const tokenUri: string = await contract.tokenURI(tokenId);
            // const cleanedTokenUri = tokenUri.replace("ipfs://", "");
            // console.log(cleanedTokenUri);
            console.log(tokenUri)
            
          const metadata = await fetchMetadata(tokenUri);
          return { tokenId, metadata };
        })
      );

      console.log(nftData)

      setNfts(nftData);
    } catch (error: any) {
      console.error("Error fetching NFTs:", error);
      toast.error(error.message || "Failed to load NFTs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchMetadata(ipfsUri: string) {
    try {
      const ipfsHash = ipfsUri.replace("ipfs://", "");
      const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      const response = await fetch(url);
    //   console.log(response)

      if (!response.ok) throw new Error("Failed to fetch metadata");
      const data = await response.json()
      console.log(data)
      return data;
    } catch (error) {
      console.error("❌ Error fetching metadata:", error);
      return null;
    }
  }

  function getRarityColor(rarity: string) {
    switch (rarity?.toLowerCase()) {
      case "legendary": return "text-yellow-400";
      case "epic": return "text-purple-500";
      case "rare": return "text-blue-500";
      case "uncommon": return "text-green-500";
      default: return "text-gray-300";
    }
  }

  function getRarityBorder(rarity: string) {
    switch (rarity?.toLowerCase()) {
      case "legendary": return "border-yellow-400";
      case "epic": return "border-purple-500";
      case "rare": return "border-blue-500";
      case "uncommon": return "border-green-500";
      default: return "border-gray-400";
    }
  }

  function getRarityFromAttributes(attributes: any[]) {
    if (!attributes) return "common";
    const rarityAttr = attributes.find(attr => 
      attr.trait_type?.toLowerCase() === "rarity" || 
      attr.trait_type?.toLowerCase() === "tier"
    );
    return rarityAttr?.value || "common";
  }

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center">
          <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400 drop-shadow-lg">
            🎮 YOUR NFT INVENTORY
          </h1>
          <div className="bg-gray-800 px-4 py-2 rounded-full mt-2 mb-4 flex items-center space-x-2 shadow-lg">
            <div className={`w-3 h-3 rounded-full ${account ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm font-mono">
              {account 
                ? `${account.slice(0, 6)}...${account.slice(-4)}` 
                : "Connect Wallet"
              }
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-blue-400 font-semibold">Loading your NFT collection...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && nfts.length === 0 && (
          <div className="text-center py-20 bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
            <div className="mb-4 text-6xl">🎲</div>
            <h3 className="text-xl font-bold mb-2">Your inventory is empty!</h3>
            <p className="text-gray-400 mb-6">Complete quests to earn game NFTs</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 shadow-lg shadow-blue-900/50">
              Start Adventure
            </button>
          </div>
        )}

        {/* NFT Grid */}
        {!loading && nfts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft, index) => {
              const rarity = getRarityFromAttributes(nft.metadata?.attributes);
              const rarityColor = getRarityColor(rarity);
              const rarityBorder = getRarityBorder(rarity);
              
              return (
                <div 
                  key={index}
                  className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${rarityBorder} transition-all duration-300 hover:shadow-lg hover:shadow-${rarityBorder.replace('border-', '')}/30 hover:-translate-y-1`}
                >
                  {/* NFT Image */}
                  <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                    {nft.metadata?.image ? (
                      <Image
                        src={nft.metadata.metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                        alt={nft.metadata?.name || "NFT"}
                        layout="fill"
                        objectFit="contain"
                        className="p-2"
                      />
                    ) : (
                      <div className="text-4xl">🎮</div>
                    )}
                    
                    {/* Rarity Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold uppercase ${rarityColor} bg-gray-900 bg-opacity-70`}>
                      {rarity}
                    </div>
                    
                    {/* Token ID Badge */}
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-mono bg-black bg-opacity-70">
                      #{nft.tokenId.toString()}
                    </div>
                  </div>
                  
                  {/* NFT Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1 truncate">
                      {nft.metadata?.name || "Unnamed NFT"}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 h-12 overflow-hidden">
                      {nft.metadata?.description || "No description"}
                    </p>
                    
                    {/* Attributes */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {nft.metadata?.attributes
                        ?.filter((attr: any) => 
                          attr.trait_type?.toLowerCase() !== "rarity" && 
                          attr.trait_type?.toLowerCase() !== "tier"
                        )
                        .slice(0, 4)
                        .map((attr: any, idx: number) => (
                          <div 
                            key={idx}
                            className="bg-gray-700 bg-opacity-50 px-2 py-1 rounded text-xs"
                          >
                            <span className="text-gray-400">{attr.trait_type}: </span>
                            <span className="font-medium">{attr.value}</span>
                          </div>
                        ))
                      }
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={() => openRentModal(nft)}
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 text-sm font-bold shadow-md"
                    >
                      List for Rent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rent Modal */}
      {showModal && selectedNft && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl border-2 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-400">
                List NFT for Rent
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
                      src={selectedNft.metadata.metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                      alt={selectedNft.metadata?.name || "NFT"}
                      layout="fill"
                      objectFit="contain"
                      className="p-1"
                    />
                  ) : (
                    <div className="text-2xl flex items-center justify-center h-full">🎮</div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold">
                    {selectedNft.metadata?.name || "Unnamed NFT"}
                  </h4>
                  <p className="text-sm text-gray-400">
                    ID: #{selectedNft.tokenId}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Token ID (pre-filled)
                  </label>
                  <input
                    type="number"
                    value={tokenIdtoRent}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Price per hour (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.1"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Set the hourly rate in ETH for renting this NFT
                  </p>
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
                onClick={listForRent}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2 rounded-md transition duration-200 font-medium ${
                  isSubmitting 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? 'Processing...' : 'List NFT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}