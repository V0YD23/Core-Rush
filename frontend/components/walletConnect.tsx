"use client";
import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Toaster, toast } from "react-hot-toast";
import { Contract } from "ethers";
import StakeInterface from "../components/stakeInterface";
import NFTMintPopup from "../components/nft";
import { Star, Coins, Heart } from "lucide-react";
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
        const resp = await fetch(`${api}/api/User/current-level?publicKey=${address}`);
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
            level: lev,
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
              <NFTMintSuccessToast level={lev} />
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
    const resp = await fetch(`${api}/current-level?publicKey=${address}`);
    const temp = await resp.json();
    const lev = temp.level;
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
            <CollectCoins
              gameScore={gameScore}
              setGameScore={setgameScore}
              handleWithdraw={handleWithdraw}
              isLoading={isLoading}
              stakedBalance={stakedBalance}
            />

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
