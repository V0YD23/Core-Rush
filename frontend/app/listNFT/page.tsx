"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NFT } from "@/abi/nft.js";
import Image from "next/image";

const contractAddress = "0x15da21C1A652E582f9adAD7d728fDf4ED3232770";

export default function MyNFTs() {
  const [nfts, setNfts] = useState<{ tokenId: number; metadata: any }[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    if (!window.ethereum) {
      alert("Please install MetaMask to view your NFT inventory");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const contract = new ethers.Contract(contractAddress, NFT, signer);

      // Fetch NFT token IDs owned by the user
      const tokenIds: number[] = await contract.getOwnedNFTs(userAddress);
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const tokenUri: string = await contract.tokenURI(tokenId);
          const metadata = await fetchMetadata(tokenUri);
          return { tokenId, metadata };
        })
      );

      setNfts(nftData);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
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
              const rarity = getRarityFromAttributes(nft.metadata?.metadata?.attributes);
              const rarityColor = getRarityColor(rarity);
              const rarityBorder = getRarityBorder(rarity);
              
              return (
                <div 
                  key={index}
                  className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${rarityBorder} transition-all duration-300 hover:shadow-lg hover:shadow-${rarityBorder.replace('border-', '')}/30 hover:-translate-y-1`}
                >
                  {/* NFT Image */}
                  <div className="relative h-48 bg-gray-900 flex items-center justify-center">
                    {nft.metadata?.metadata?.image ? (
                      <Image
                        src={nft.metadata.metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                        alt={nft.metadata?.metadata?.name || "NFT"}
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
                      {nft.metadata?.metadata?.name || "Unnamed NFT"}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4 h-12 overflow-hidden">
                      {nft.metadata?.metadata?.description || "No description"}
                    </p>
                    
                    {/* Attributes */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {nft.metadata?.metadata?.attributes
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
                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200 text-sm font-bold shadow-md">
                      Use Item
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}