"use client";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Toaster, toast } from "react-hot-toast";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from "../abi/core.js";
import { NFT } from "../abi/nft.js";
import StakeInterface from "../components/stakeInterface";
import NFTMintPopup from "../components/nft";
import { Trophy, CheckCircle2 } from "lucide-react";
const STAKING_CONTRACT_ABI = contractABI;
const STAKING_CONTRACT_ADDRESS = "0xAeE90204B5E530FE6c0B2C0299436E0Be88529f4";
import { Star, Coins, Heart } from "lucide-react";
const NFT_CONTRACT_ABI = NFT;
const NFT_CONTRACT_ADDRESS = "0x15da21C1A652E582f9adAD7d728fDf4ED3232770";
import {
  Loader2,
  Wallet,
  Gamepad,
  ArrowDownCircle,
  ArrowUpCircle,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { connect } from "http2";
interface WalletConnectProps {
  provider: BrowserProvider | undefined;
  setProvider: React.Dispatch<
    React.SetStateAction<BrowserProvider | undefined>
  >;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
  isLoading,
  setIsLoading,
  error,
  setError,
  stakeAmount,
  setStakeAmount,
}) => {
  const [gameScore, setgameScore] = useState(
    () =>
      (typeof window !== "undefined" && localStorage.getItem("gameScore")) || ""
  );
  const [estimatedProfit, setEstimatedProfit] = useState<number>(0);
  const [isCalculatingProfit, setIsCalculatingProfit] = useState(false);
  const [expectedScore, setExpectedScore] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("expectedScore")) ||
      ""
  );
  const [isStaked, setIsStaked] = useState(
    () =>
      (typeof window !== "undefined" && localStorage.getItem("isStaked")) ===
      "true"
  );
  const [nftContract, setNftContract] = useState<Contract>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [stakedBalance, setStakedBalance] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("stakedBalance")) ||
      "0"
  );

  const [contract, setContract] = useState<Contract>();
  const api = process.env.NEXT_PUBLIC_BACKEND_API;
  const router = useRouter();

  // Custom Toast Components
  const WithdrawSuccessToast = ({ amount }: any) => (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500/90 to-green-600/90 rounded-xl border-2 border-green-400 shadow-lg backdrop-blur-sm">
      <div className="flex-shrink-0">
        <Coins className="w-6 h-6 text-yellow-300 animate-bounce" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-white">Coins Collected!</p>
        <p className="text-sm text-green-100">
          {amount} ETH withdrawn successfully
        </p>
      </div>
      <CheckCircle2 className="w-5 h-5 text-green-200 animate-pulse" />
    </div>
  );

  const NFTMintSuccessToast = ({ level }: any) => (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/90 to-purple-600/90 rounded-xl border-2 border-blue-400 shadow-lg backdrop-blur-sm">
      <div className="flex-shrink-0">
        <Trophy className="w-6 h-6 text-yellow-300 animate-float" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-white">NFT Minted!</p>
        <p className="text-sm text-blue-100">
          Level {level} achievement unlocked
        </p>
      </div>
      <CheckCircle2 className="w-5 h-5 text-blue-200 animate-pulse" />
    </div>
  );

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

    console.log(isStaked);
  }, [stakeAmount, expectedScore]);

  // 🔹 Load `address` from localStorage on component mount
  useEffect(() => {
    const storedAddress = localStorage.getItem("address");
    if (storedAddress) {
      setAddress(storedAddress);
    }
    connectWallet();
  }, []);

  useEffect(() => {
    if (isStaked) {
      fetchGameScore();
    }
  }, [stakedBalance]);

  useEffect(() => {
    localStorage.setItem("stakedBalance", stakedBalance);
  }, [stakedBalance]);

  useEffect(() => {
    localStorage.setItem("isStaked", isStaked.toString());
  }, [isStaked]);

  useEffect(() => {
    localStorage.setItem("gameScore", gameScore.toString());
  }, [gameScore]);

  useEffect(() => {
    localStorage.setItem("expectedScore", expectedScore.toString());
  }, [expectedScore]);

  const fetchGameScore = async () => {
    try {
      const response = await fetch(`${api}/api/message?publicKey=${address}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      setgameScore(data.score.toString());

      console.log(data);
    } catch (error) {
      console.error("Failed to fetch User's Game Score:", error);
    }
  };

  // Example function that might be called when a user completes a level
  const handleLevelComplete = () => {
    setCurrentLevel((prev) => prev + 1);
    setIsPopupOpen(true);
  };

  const estimateProfit = async (stakedAmount: number, score: number) => {
    if (stakedAmount <= 0 || score <= 0) return;

    setIsCalculatingProfit(true);

    try {
      const response = await fetch(`${api}/get-core-price`);
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

        const response = await fetch(`${api}/create-user`, {
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
      console.log("fetched");
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



  // Enhanced withdraw function
  const handleWithdraw = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Show pending toast
      toast.loading(
        <div className="flex items-center gap-2">
          <span className="text-blue-700 font-bold">
            Processing withdrawal...
          </span>
        </div>,
        {
          style: {
            background: "rgba(255, 255, 255, 0.9)",
            borderRadius: "12px",
            padding: "12px",
            border: "2px solid #93c5fd",
          },
        }
      );

      const targetScore = await contract.getTargetSet(address);

      const response = await fetch(`${api}/generate-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalScore: Number(gameScore) }),
      });

      if (!response.ok) throw new Error("Failed to fetch proof");
      const { calldata } = await response.json();
      const [a, b, c, input] = calldata;

      const tx = await contract.withdraw(a, b, c, input);
      await tx.wait();

      const wonLastGame = await contract.getLatestGame(address);
      const gameWon = wonLastGame ? 1 : 0;

      const gameEndResponse = await fetch(`${api}/game-end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(gameScore),
          won: gameWon,
          publicKey: address,
        }),
      });

      if (!gameEndResponse.ok) throw new Error("Failed to fetch proof");

      // Dismiss the pending toast
      toast.dismiss();

      // Show withdrawal success toast
      toast.custom(
        (t: any) => (
          <div className={`${t.visible ? "animate-enter" : "animate-leave"}`}>
            <WithdrawSuccessToast amount={gameScore} />
          </div>
        ),
        {
          duration: 4000,
        }
      );

      if (gameWon) {
        const response = await fetch(`${api}/generate-metadata-nft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: address, score: gameScore }),
        });

        if (!response.ok) throw new Error("Failed to generate metadata");
        const { metadata } = await response.json();

        if (!metadata) throw new Error("Received null metadata");

        const hash = await uploadToIPFS(metadata);
        if (!hash) throw new Error("Failed to upload metadata to IPFS");

        await fetchStakedBalance(contract, address);
        setgameScore("");
        setIsStaked(false);

        const tx = await nftContract?.mintLevelNFT(address, 8, hash);
        await tx.wait();

        // Show NFT mint success toast
        toast.custom(
          (t: any) => (
            <div className={`${t.visible ? "animate-enter" : "animate-leave"}`}>
              <NFTMintSuccessToast level={6} />
            </div>
          ),
          {
            duration: 5000,
          }
        );

        handleLevelComplete();
      }
    } catch (error) {
      toast.error(
        <div className="flex items-center gap-2">
          <span className="text-red-700 font-bold">Transaction failed</span>
          <p className="text-sm text-red-600">{(error as Error).message}</p>
        </div>,
        {
          style: {
            background: "rgba(254, 226, 226, 0.9)",
            borderRadius: "12px",
            padding: "12px",
            border: "2px solid #ef4444",
          },
          duration: 5000,
        }
      );
      setError("Withdrawal failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadToIPFS = async (metadata: any) => {
    try {
      const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"; // Use pinJSONToIPFS for metadata

      const response = await axios.post(url, metadata, {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: "30822c42812cd6ea5b8c",
          pinata_secret_api_key:
            "efa8ce1324868fbe358863c37069edb9542087a67df7ddaf6b61ca10a232081b",
        },
      });

      // Get IPFS hash (CID)
      const ipfsHash = response.data.IpfsHash;
      console.log(`✅ Metadata uploaded! IPFS Hash: ${ipfsHash}`);
      return `ipfs://${ipfsHash}`; // Return IPFS URL
    } catch (error: any) {
      console.error(
        "❌ Error uploading metadata to IPFS:",
        error.response ? error.response.data : error.message
      );
      return null;
    }
  };

  // Function to handle game navigation
  const handlePlayGame = () => {
    router.push("/game/Game.html"); // Replace with your actual game route
  };
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "",
          style: {
            background: "#363636",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        }}
      />
      <div className="w-full max-w-md mx-auto space-y-6 animate-fadeIn">
        {!address ? (
          <div className="bg-white/90 rounded-xl p-8 border-4 border-yellow-400 shadow-xl text-center space-y-4">
            <Star className="w-16 h-16 text-yellow-400 mx-auto animate-spin" />
            <h2 className="text-2xl font-bold text-blue-700">
              Start Your Adventure!
            </h2>
            <StakeInterface
              connectWallet={connectWallet}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connected Address Card */}
            <div className="bg-white/90 rounded-xl p-4 border-4 border-green-400 shadow-lg">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6 text-red-500 animate-pulse" />
                <div className="text-sm font-bold text-blue-700">
                  Player Connected:
                  <span className="ml-2 text-red-500">
                    {address.substring(0, 6)}...
                    {address.substring(address.length - 4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Staked Balance Card */}
            <div className="bg-yellow-300 rounded-xl p-6 border-4 border-yellow-500 shadow-lg">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-600 animate-bounce" />
                <div>
                  <p className="text-sm text-yellow-800 font-bold">
                    Coins Collected
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stakedBalance} ETH
                  </p>
                </div>
              </div>
            </div>

            {/* Staking Section */}
            <div className="bg-white/90 rounded-xl p-6 border-4 border-blue-400 shadow-lg space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-700">
                  Expected Score
                </label>
                <input
                  type="number"
                  value={expectedScore}
                  onChange={(e) => setExpectedScore(e.target.value)}
                  placeholder="Enter score (0-100)"
                  className="w-full px-4 py-3 bg-blue-50 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all text-blue-700"
                  min="0"
                  max="100"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-blue-700">
                  Power Up Amount
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount in ETH"
                    className="flex-1 px-4 py-3 bg-blue-50 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all text-blue-700"
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
                    className="px-6 py-3 bg-green-500 hover:bg-green-400 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center gap-2 border-b-4 border-green-700 hover:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 transform active:translate-y-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Star className="w-5 h-5" />
                    )}
                    Power Up!
                  </button>
                </div>
              </div>

              {/* Estimated Profit Display */}
              {isCalculatingProfit ? (
                <div className="animate-pulse bg-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    <p className="text-sm font-bold text-blue-500">
                      Calculating bonus...
                    </p>
                  </div>
                </div>
              ) : estimatedProfit !== null && Number(stakeAmount) > 0 ? (
                <div className="bg-green-100 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm font-bold text-green-700 mb-1">
                    Bonus Coins
                  </p>
                  <p className="text-xl font-bold text-green-600">
                    {estimatedProfit.toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Power level: {expectedScore} points
                  </p>
                </div>
              ) : null}
            </div>

            {isStaked && (
              <div className="mt-4">
                <button
                  onClick={handlePlayGame}
                  className="w-full px-6 py-4 bg-red-500 hover:bg-red-400 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border-b-4 border-red-700 hover:border-red-500 active:border-b-0 transform active:translate-y-1"
                >
                  <Gamepad className="w-6 h-6" />
                  Start Game!
                </button>
                <p className="text-sm font-bold text-green-600 text-center mt-2">
                  Power-up activated! Ready to play! 🎮
                </p>
              </div>
            )}

            {/* Withdraw Section */}
            <div className="bg-white/90 rounded-xl p-6 border-4 border-red-400 shadow-lg space-y-4">
              <label className="text-sm font-bold text-blue-700">
                Collect Coins
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={gameScore}
                  onChange={(e) => setgameScore(e.target.value)}
                  placeholder="Amount in ETH"
                  className="flex-1 px-4 py-3 bg-blue-50 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all text-blue-700"
                  min="0"
                  step="0.01"
                  max={stakedBalance}
                />
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading || !gameScore || Number(gameScore) <= 0}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 rounded-xl font-bold text-yellow-900 shadow-lg transition-all duration-200 flex items-center gap-2 border-b-4 border-yellow-500 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 transform active:translate-y-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                  Collect
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border-4 border-red-400 rounded-xl p-4 flex items-center gap-3 animate-slideIn max-w-full overflow-hidden break-words">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm font-bold break-words overflow-hidden">
                  {error}
                </p>
              </div>
            )}
          </div>
        )}
        {/* NFT Mint Popup */}
        <NFTMintPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          level={currentLevel}
          autoCloseDelay={5000} // Optional: automatically close after 5 seconds
        />
      </div>
    </>
  );
};

export default WalletConnect;
