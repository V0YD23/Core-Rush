"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Sword, Crown, Coins, ArrowRight } from "lucide-react";
import { ethers, BrowserProvider } from "ethers";
export default function TournamentPage() {
  const api = process.env.NEXT_PUBLIC_BACKEND_API;

  const [isStaked, setIsStaked] = useState(false);
  const [stakeAmount] = useState(0.5);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [provider, setProvider] = useState<BrowserProvider>();
  const [account, setAccount] = useState(() => 
    (typeof window !== "undefined" && localStorage.getItem("account")) || ""
  );
  
  const [loading, setLoading] = useState(true);

  const isUserInLeaderboard = leaderboardData.some(
    (player) => player.address === account
  );

  useEffect(() => {
    loadAccount();
  }, []);

  useEffect(() => {
    localStorage.setItem("account", account.toString());
  }, [account]);

  async function loadAccount() {
    if (!window.ethereum) {
      // toast.error("Please install MetaMask to view available NFTs");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const signer = await provider?.getSigner();
      const userAddress = await signer?.getAddress();
      if(typeof userAddress !== "undefined"){
        setAccount(userAddress);
      }

      setProvider(provider);
    } catch (error) {
      console.error("Error fetching available Account:", error);
    }
  }


  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-cyan-950 text-white p-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.div
          className="flex justify-center mb-6"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Trophy className="w-20 h-20 text-yellow-400" />
        </motion.div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-transparent bg-clip-text">
          Aqua Tournament
        </h1>
        <p className="text-xl text-cyan-200 max-w-2xl mx-auto">
          Stake your ETH, climb the leaderboard, and claim legendary rewards in
          the ultimate underwater battle
        </p>
      </motion.div>

      {/* Staking Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto mb-16"
      >
        <div className="bg-white/5 backdrop-blur-lg border border-cyan-500/20 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl text-cyan-100 flex items-center gap-2">
              <Coins className="w-6 h-6 text-cyan-400" />
              Tournament Stake
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-cyan-200">Required Stake</span>
              <span className="text-2xl font-bold text-cyan-100">
                {stakeAmount} ETH
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isUserInLeaderboard || isStaked}
              onClick={() => setIsStaked(true)}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
                ${
                  isUserInLeaderboard || isStaked
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                }`}
            >
              {isUserInLeaderboard ? (
                "Already Participating"
              ) : isStaked ? (
                "Staked Successfully"
              ) : (
                <>
                  Stake & Enter
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {isStaked && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-200">
                  Successfully staked! You're now in the tournament.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
              Tournament Leaderboard
            </span>
          </h2>
          <p className="text-cyan-200">
            Top warriors competing for eternal glory
          </p>
        </div>

        <div className="space-y-4">
          {leaderboardData.map((player, index) => (
            <motion.div
              key={player.address}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`rounded-lg backdrop-blur-lg border transition-all p-6
                  ${
                    player.address === account
                      ? "bg-cyan-500/20 border-cyan-400/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 text-2xl font-bold text-cyan-400">
                      #{player.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-cyan-100">
                        {player.address}
                      </div>
                      <div className="text-cyan-300 flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        Score: {player.score}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                      {player.rewards} ETH
                    </div>
                    <div className="text-yellow-200/80 text-sm">
                      Potential Reward
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
