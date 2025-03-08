"use client";
import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Toaster, toast } from "react-hot-toast";
import { Contract } from "ethers";
import { motion } from "framer-motion";
import StakeInterface from "../components/stakeInterface";
import NFTMintPopup from "../components/nft";
import { Star, Coins, Shield, Sparkles } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { uploadToIPFS } from "@/utils/ipfsUpload";
import CollectCoins from "./collectCoins";
import { Loader2, Gamepad, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { WalletConnectProps } from "@/interfaces/walletConnect.js";
import { WithdrawSuccessToast, NFTMintSuccessToast } from "./SuccessToast";
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
  const [estimatedProfit, setEstimatedProfit] = useState<number>(0);
  const [contract, setContract] = useState<Contract>();
  const [isCalculatingProfit, setIsCalculatingProfit] = useState(false);
  const [nftContract, setNftContract] = useState<Contract>();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);
  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };
  const [gameScore, setgameScore] = useState(
    () =>
      (typeof window !== "undefined" && localStorage.getItem("gameScore")) || ""
  );
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
  const [stakedBalance, setStakedBalance] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("stakedBalance")) ||
      "0"
  );

  const api = process.env.NEXT_PUBLIC_BACKEND_API;
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

    console.log(isStaked);
  }, [stakeAmount, expectedScore]);

  // 🔹 Load `address` from localStorage on component mount
  useEffect(() => {
    console.log(isLoading);
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
    // setCurrentLevel((prev) => prev + 1);
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
      // setIsLoading(true);
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
      // setIsLoading(false);
    }
  };

  // Enhanced withdraw function
  const handleWithdraw = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      // setIsLoading(true);
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

      const response = await fetch(
        `${api}/api/message?publicKey=${encodeURIComponent(address)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      const score = data.score;
      setgameScore(score);
      console.log(score);

      const tx = await contract.withdraw(score);
      await tx.wait();

      // const wonLastGame = await contract.getLatestGame(address);
      // const gameWon = wonLastGame ? 1 : 0;
      const gameWon = 1;
      console.log(score, gameWon, address);

      const gameEndResponse = await fetch(`${api}/api/User/game-end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: score,
          won: gameWon,
          publicKey: address,
        }),
      });

      if (!gameEndResponse.ok) throw new Error("Failed to End Game");

      // Dismiss the pending toast
      toast.dismiss();

      // Show withdrawal success toast
      toast.custom(
        (t: any) => (
          <div className={`${t.visible ? "animate-enter" : "animate-leave"}`}>
            <WithdrawSuccessToast amount={score} />
          </div>
        ),
        {
          duration: 4000,
        }
      );

      if (gameWon) {
        const resp = await fetch(
          `${api}/api/User/current-level?publicKey=${address}`
        );
        const temp = await resp.json();
        const lev = temp.level;
        console.log("level " + lev);
        setCurrentLevel(lev);

        const response = await fetch(`${api}/generate-metadata-nft`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: address,
            score: score,
            level: lev - 1,
          }),
        });

        if (!response.ok) throw new Error("Failed to generate metadata");
        const { metadata } = await response.json();

        if (!metadata) throw new Error("Received null metadata");

        const hash = await uploadToIPFS(metadata);
        if (!hash) throw new Error("Failed to upload metadata to IPFS");

        await fetchStakedBalance(contract, address);
        setgameScore("");
        setIsStaked(false);
        setStakeAmount("");

        const tx = await nftContract?.mintLevelNFT(address, lev, hash);
        await tx.wait();

        const res = await fetch(`${api}/api/reset-score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: address }),
        });

        if (!res.ok) throw new Error("Failed to fetch proof");

        // Show NFT mint success toast
        toast.custom(
          (t: any) => (
            <div className={`${t.visible ? "animate-enter" : "animate-leave"}`}>
              <NFTMintSuccessToast level={lev - 1} />
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
      // setIsLoading(false);
    }
  };

  // Function to handle game navigation
  const handlePlayGame = async () => {
    const resp = await fetch(
      `${api}/api/User/current-level?publicKey=${address}`
    );
    const temp = await resp.json();
    const lev = temp.level;
    console.log("cliecke");
    router.push(`/game/level_${lev}/Game.html?publicKey=${address}`); // Replace with your actual game route
  };
  const { connectWallet } = useWallet(
    setAddress,
    setProvider,
    setContract,
    setNftContract,
    fetchStakedBalance,
    api,
    setError
  );

  return (
<>
  <Toaster position="bottom-right" />
  <div className="w-full max-w-md mx-auto space-y-6">
    {!address ? (
      <motion.div
        variants={{
          initial: { scale: 0.9, opacity: 0 },
          animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
        }}
        initial="initial"
        animate="animate"
        className="bg-red-600 rounded-xl p-8 border-4 border-yellow-400 shadow-2xl text-center space-y-4"
      >
        <motion.div 
          className="relative"
          animate={{ rotate: [0, 10, 0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Shield className="w-20 h-20 text-yellow-400 mx-auto" />
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Star className="absolute top-0 right-1/4 w-8 h-8 text-yellow-300" />
          </motion.div>
        </motion.div>
        <motion.h2 
          className="text-3xl font-black text-yellow-300 uppercase tracking-wider"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          ENTER THE ARENA
        </motion.h2>
        <StakeInterface
          connectWallet={connectWallet}
          isLoading={isLoading}
        />
      </motion.div>
    ) : (
      <div className="space-y-6">
        {/* Connected Address Card */}
        <motion.div
          variants={{
            initial: { x: -100, opacity: 0 },
            animate: { x: 0, opacity: 1, transition: { duration: 0.5 } }
          }}
          initial="initial"
          animate="animate"
          className="bg-green-600 rounded-xl p-6 border-4 border-green-800 shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Shield className="w-10 h-10 text-yellow-400" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-white">
                PLAYER CONNECTED
              </p>
              <p className="text-xl font-black text-yellow-300">
                {address.substring(0, 6)}...
                {address.substring(address.length - 4)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          variants={{
            initial: { y: 50, opacity: 0 },
            animate: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.2 } }
          }}
          initial="initial"
          animate="animate"
          className="bg-blue-600 rounded-xl p-6 border-4 border-blue-800 shadow-2xl"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Coins className="w-12 h-12 text-yellow-400" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-300" />
              </motion.div>
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                LOOT CHEST
              </p>
              <motion.p 
                className="text-3xl font-black text-yellow-300"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {stakedBalance} CORE
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Staking Section */}
        <motion.div
          variants={{
            initial: { y: 50, opacity: 0 },
            animate: { y: 0, opacity: 1, transition: { duration: 0.5, delay: 0.4 } }
          }}
          initial="initial"
          animate="animate"
          className="bg-purple-700 rounded-xl p-6 border-4 border-purple-900 shadow-2xl"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white">
                POWER LEVEL TARGET
              </label>
              <input
                type="number"
                value={expectedScore}
                onChange={(e) => setExpectedScore(e.target.value)}
                placeholder="Enter power (0-100)"
                className="w-full px-4 py-3 bg-purple-900 rounded-xl border-2 border-purple-900 focus:border-yellow-300 focus:ring-4 focus:ring-yellow-400/20 transition-all text-yellow-300 placeholder-yellow-200/50 font-bold"
                min="0"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white">
                ENERGY CHARGE
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="CORE amount"
                  className="flex-1 px-4 py-3 bg-purple-900 rounded-xl border-2 border-purple-900 focus:border-yellow-300 focus:ring-4 focus:ring-yellow-400/20 transition-all text-yellow-300 placeholder-yellow-200/50 font-bold"
                  min="0"
                  step="0.01"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStake}
                  disabled={
                    isLoading ||
                    !stakeAmount ||
                    Number(stakeAmount) <= 0 ||
                    !expectedScore
                  }
                  className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center gap-2 border-b-4 border-red-900 hover:border-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 transform active:translate-y-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    >
                      <Star className="w-5 h-5" />
                    </motion.div>
                  )}
                  CHARGE UP!
                </motion.button>
              </div>
            </div>

            {isCalculatingProfit ? (
              <div className="animate-pulse bg-purple-900 rounded-xl p-4 border-2 border-purple-900">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-300">
                    CALCULATING BONUS...
                  </p>
                </div>
              </div>
            ) : estimatedProfit !== null && Number(stakeAmount) > 0 ? (
              <motion.div 
                className="bg-purple-900 rounded-xl p-4 border-2 border-purple-900"
                animate={{ borderColor: ['#facc15', '#fde047', '#facc15'] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <p className="text-sm font-bold text-white mb-1">
                  BONUS REWARDS
                </p>
                <motion.p 
                  className="text-xl font-bold text-yellow-300"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  {estimatedProfit.toFixed(4)} CORE
                </motion.p>
                <p className="text-xs text-white mt-2">
                  POWER LEVEL: {expectedScore} POINTS
                </p>
              </motion.div>
            ) : null}
          </div>
        </motion.div>

        {/* Game Controls */}
        {isStaked && (
          <motion.button
            variants={{
              initial: { scale: 0.9, opacity: 0 },
              hover: { scale: 1.05, boxShadow: "0 0 15px 5px rgba(255,0,0,0.5)" },
              tap: { scale: 0.95 }
            }}
            initial="initial"
            animate={{ scale: 1, opacity: 1 }}
            whileHover="hover"
            whileTap="tap"
            onClick={handlePlayGame}
            className="w-full px-8 py-4 bg-red-600 rounded-xl font-black text-2xl text-white shadow-2xl transition-all duration-200 flex items-center justify-center gap-3 border-b-4 border-red-900 uppercase tracking-wider"
          >
            <motion.div
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Gamepad className="w-8 h-8" />
            </motion.div>
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              BATTLE NOW!
            </motion.span>
          </motion.button>
        )}

        {/* Withdraw Section */}
        <CollectCoins
          gameScore={gameScore}
          setGameScore={setgameScore}
          handleWithdraw={handleWithdraw}
          isLoading={isLoading}
          stakedBalance={stakedBalance}
        />

        {/* Error Display */}
        {error && (
          <motion.div
            variants={{
              initial: { scale: 0.9, opacity: 0 },
              animate: { scale: 1, opacity: 1, transition: { duration: 0.3 } }
            }}
            initial="initial"
            animate="animate"
            className="bg-red-600 rounded-xl p-6 border-4 border-yellow-400 shadow-2xl flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <p className="text-white font-bold">{error}</p>
          </motion.div>
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
