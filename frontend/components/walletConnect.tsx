"use client";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from "../abi/core.js";
import { NFT } from "../abi/nft.js";
import StakeInterface from "../components/stakeInterface";
const STAKING_CONTRACT_ABI = contractABI;
const STAKING_CONTRACT_ADDRESS = "0xAeE90204B5E530FE6c0B2C0299436E0Be88529f4";

const NFT_CONTRACT_ABI = NFT;
const NFT_CONTRACT_ADDRESS = "0x695eF9bCEb3FEb43A5cDC13E450bf55C8c661BFA";
import {
  Loader2,
  Wallet,
  Gamepad,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
interface WalletConnectProps {
  provider: BrowserProvider | undefined;
  setProvider: React.Dispatch<
    React.SetStateAction<BrowserProvider | undefined>
  >;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  contract: Contract | undefined;
  setContract: React.Dispatch<React.SetStateAction<Contract | undefined>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  stakedBalance: string;
  setStakedBalance: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  stakeAmount: string;
  setStakeAmount: React.Dispatch<React.SetStateAction<string>>;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  provider,
  setProvider,
  address,
  setAddress,
  contract,
  setContract,
  isLoading,
  setIsLoading,
  stakedBalance,
  setStakedBalance,
  error,
  setError,
  stakeAmount,
  setStakeAmount,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [estimatedProfit, setEstimatedProfit] = useState<number>(0);
  const [isCalculatingProfit, setIsCalculatingProfit] = useState(false);
  const [expectedScore, setExpectedScore] = useState("");
  const [isStaked, setIsStaked] = useState(false);
  const [nftContract, setNftContract] = useState<Contract>();

  const router = useRouter();
  // Effect to calculate profit when stake amount or score changes
  useEffect(() => {
    if (
      stakeAmount &&
      Number(stakeAmount) > 0 &&
      expectedScore &&
      Number(expectedScore) > 0
    ) {
      estimateProfit(Number(stakeAmount), Number(expectedScore));
    } else {
      setEstimatedProfit(0);
    }
  }, [stakeAmount, expectedScore]);

  const estimateProfit = async (stakedAmount: number, score: number) => {
    if (stakedAmount <= 0 || score <= 0) return;

    setIsCalculatingProfit(true);

    try {
      const response = await fetch("https://localhost:8443/get-core-price");
      const data = await response.json();

      if (data?.price) {
        const corePrice = data.price;
        const referencePrice = 10; // The price where multiplier = 1

        // Calculate price-based multiplier (capped at 3)
        let priceMultiplier = Math.min(referencePrice / corePrice, 3);

        // Calculate score-based multiplier (assuming max score is 100)
        const scoreMultiplier = Math.min(score / 100, 1);

        // Combined multiplier
        const totalMultiplier = priceMultiplier * scoreMultiplier;

        // Calculate profit (5% base profit rate)
        const profit = stakedAmount * totalMultiplier * 0.05;

        setEstimatedProfit(profit);
      }
    } catch (error) {
      console.error("Failed to fetch Core Token price:", error);
      setEstimatedProfit(0);
    } finally {
      setIsCalculatingProfit(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true);
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const userAddress = await signer.getAddress();

        setAddress(userAddress);
        setProvider(ethProvider);

        const stakingContract = new ethers.Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer
        );
        setContract(stakingContract);

        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signer
        );
        setNftContract(nftContract);

        await fetchStakedBalance(stakingContract, userAddress);

        const response = await fetch("https://localhost:8443/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: userAddress }),
        });

        if (!response.ok) throw new Error("Failed to fetch proof");
      } catch (error) {
        setError("Connection failed: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  const fetchStakedBalance = async (
    contractInstance: ethers.Contract,
    userAddress: string
  ) => {
    try {
      const balance = await contractInstance.getStakedBalance(userAddress);
      setStakedBalance(ethers.formatEther(balance));
    } catch (error) {
      setError("Failed to fetch staked balance: " + (error as Error).message);
    }
  };

  const handleStake = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    if (!expectedScore || Number(expectedScore) <= 0) {
      setError("Please enter your expected score first");
      return;
    }
    console.log("Expected Score :", expectedScore);
    try {
      setIsLoading(true);
      setError("");

      const tx = await contract.stake(expectedScore, {
        value: BigInt(stakeAmount), // Convert stakeAmount to BigInt for correct handling
      });
      await tx.wait();
      // After successful staking:
      setIsStaked(true);

      await fetchStakedBalance(contract, address);
      setStakeAmount("");
      setEstimatedProfit(0);
      setExpectedScore("");
    } catch (error) {
      setError("Staking failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const targetScore = await contract.getTargetSet(address); // Fetch the target score

      const response = await fetch("https://localhost:8443/generate-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalScore: Number(withdrawAmount) }),
      });

      if (!response.ok) throw new Error("Failed to fetch proof");
      const { calldata } = await response.json();
      const [a, b, c, input] = calldata;

      // 🔹 Now call the withdraw function
      const tx = await contract.withdraw(a, b, c, input);
      await tx.wait();

      const wonLastGame = await contract.getLatestGame(address);

      const gameWon = wonLastGame ? 1 : 0;

      const gameEndResponse = await fetch("https://localhost:8443/game-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(withdrawAmount),
          won: gameWon,
          publicKey: address,
        }),
      });

      if (!gameEndResponse.ok) throw new Error("Failed to fetch proof");

      if (gameWon) {
        const response = await fetch(
          "https://localhost:8443/generate-metadata-nft",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicKey: address, score: withdrawAmount }),
          }
        );

        if (!response.ok) throw new Error("Failed to generate metadata");

        const { metadata } = await response.json();

        console.log("Generated Metadata:", metadata); // Debugging

        if (!metadata) throw new Error("Received null metadata");

        // ✅ Upload to IPFS
        const hash = await uploadToIPFS(metadata);
        if (!hash) throw new Error("Failed to upload metadata to IPFS");

        console.log("IPFS Hash:", hash);

        const tx = await nftContract?.mintLevelNFT(address, 2, hash);
        await tx.wait();
      }

      await fetchStakedBalance(contract, address);
      setWithdrawAmount("");
    } catch (error) {
      setError("Withdrawal failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToIPFS = async (metadata:any) => {
    try {
        const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"; // Use pinJSONToIPFS for metadata

        const response = await axios.post(url, metadata, {
            headers: {
                "Content-Type": "application/json",
                "pinata_api_key": "30822c42812cd6ea5b8c",
                "pinata_secret_api_key": "efa8ce1324868fbe358863c37069edb9542087a67df7ddaf6b61ca10a232081b",
            },
        });

        // Get IPFS hash (CID)
        const ipfsHash = response.data.IpfsHash;
        console.log(`✅ Metadata uploaded! IPFS Hash: ${ipfsHash}`);
        return `ipfs://${ipfsHash}`; // Return IPFS URL
    } catch (error:any) {
        console.error("❌ Error uploading metadata to IPFS:", error.response ? error.response.data : error.message);
        return null;
    }
};


  // Function to handle game navigation
  const handlePlayGame = () => {
    router.push("/game/First%20Game.html"); // Replace with your actual game route
  };
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fadeIn">
      {!address ? (
        <StakeInterface connectWallet={connectWallet} isLoading={isLoading} />
      ) : (
        <div className="space-y-6">
          {/* Connected Address Card */}
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 shadow-lg">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-blue-400" />
              <div className="text-sm font-medium text-gray-300">
                Connected:
                <span className="ml-2 text-blue-400">
                  {address.substring(0, 6)}...
                  {address.substring(address.length - 4)}
                </span>
              </div>
            </div>
          </div>

          {/* Staked Balance Card */}
          <div className="bg-gradient-to-r from-emerald-900/40 to-blue-900/40 rounded-xl p-6 border border-emerald-500/20 shadow-lg">
            <p className="text-sm text-gray-400 mb-2">Total Staked Balance</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stakedBalance} ETH
            </p>
          </div>

          {/* Staking Section */}
          <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 shadow-lg space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Expected Score
              </label>
              <input
                type="number"
                value={expectedScore}
                onChange={(e) => setExpectedScore(e.target.value)}
                placeholder="Enter score (0-100)"
                className="w-full px-4 py-2 bg-gray-700/60 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Stake Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount in ETH"
                  className="flex-1 px-4 py-2 bg-gray-700/60 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleStake}
                  disabled={
                    isLoading ||
                    !stakeAmount ||
                    Number(stakeAmount) <= 0 ||
                    !expectedScore
                  }
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 rounded-lg font-medium shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUpCircle className="w-4 h-4" />
                  )}
                  Stake
                </button>
              </div>
            </div>

            {/* Estimated Profit Display */}
            {isCalculatingProfit ? (
              <div className="animate-pulse bg-gray-700/40 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <p className="text-sm text-gray-400">Calculating profit...</p>
                </div>
              </div>
            ) : estimatedProfit !== null && Number(stakeAmount) > 0 ? (
              <div className="bg-gray-700/40 rounded-lg p-4 border border-gray-600">
                <p className="text-sm text-gray-400 mb-1">Estimated Profit</p>
                <p className="text-xl font-bold text-emerald-400">
                  {estimatedProfit.toFixed(4)} ETH
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Based on score of {expectedScore} and current market
                  conditions
                </p>
              </div>
            ) : null}
          </div>
          {isStaked && (
            <div className="mt-4">
              <button
                onClick={handlePlayGame}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-white"
              >
                <Gamepad className="w-5 h-5" />
                Play Game
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                Your stake has been confirmed. You can now play the game!
              </p>
            </div>
          )}
          {/* Withdraw Section */}
          <div className="bg-gray-800/60 rounded-xl p-6 border border-gray-700 shadow-lg space-y-4">
            <label className="text-sm font-medium text-gray-300">
              Withdraw Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount in ETH"
                className="flex-1 px-4 py-2 bg-gray-700/60 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                min="0"
                step="0.01"
                max={stakedBalance}
              />
              <button
                onClick={handleWithdraw}
                disabled={
                  isLoading || !withdrawAmount || Number(withdrawAmount) <= 0
                }
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg font-medium shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowDownCircle className="w-4 h-4" />
                )}
                Withdraw
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 animate-slideIn">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
