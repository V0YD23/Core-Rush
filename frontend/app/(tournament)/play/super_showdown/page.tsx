"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Sword,
  Crown,
  Coins,
  ArrowRight,
  Clock,
  Wallet,
  Flag,
  Play,
  UserRoundIcon
} from "lucide-react";
import { ethers, BrowserProvider, Contract } from "ethers";
import { useRouter } from "next/navigation";
// import { Warrior_Clash_Logic } from "@/abi/super_showdown_Logic";
import { Super_Showdown_Logic } from "@/abi/super_showdown_logic";
interface Player {
  _id: string;
  username: string;
  score: number;
  staked: boolean;
  played: boolean;
}

export default function TournamentPage() {
  const router = useRouter()
  const api = process.env.NEXT_PUBLIC_BACKEND_API;
  const super_showdown_Logic_contract: string =
    process.env.NEXT_PUBLIC_SUPER_SHOWDOWN_LOGIC_ADDRESS || "";

    const [isEndingTournament, setIsEndingTournament] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaked, setIsStaked] = useState(false);
  const [stakeAmount] = useState(0.5);
  const [contract, setContract] = useState<Contract>();
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [provider, setProvider] = useState<BrowserProvider>();
  const [account, setAccount] = useState(
    () =>
      (typeof window !== "undefined" && localStorage.getItem("account")) || ""
  );
  const [loading, setLoading] = useState(true);

  // Separate and sort players
  const activePlayers = leaderboardData
    .filter((player) => player.played)
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({ ...player, rank: index + 1 }));

  const waitingPlayers = leaderboardData.filter(
    (player) => player.staked && !player.played
  );

  const isUserInLeaderboard = leaderboardData.some(
    (player) => player.username === account
  );

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${api}/api/Ocean/leaderBoard`);
      const data: Player[] = await response.json();
      setLeaderboardData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    localStorage.setItem("account", account.toString());
  }, [account]);
  useEffect(() => {
    // localStorage.setItem("account", account.toString());
  }, [isStaked]);

  // Add handler for account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      setAccount("");
      setProvider(undefined);
      setContract(undefined);
      setIsStaked(false);
    } else {
      // User switched to a different account
      const newAccount = accounts[0];
      setAccount(newAccount);
      
      // Reconnect with new account
      if (window.ethereum) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await browserProvider.getSigner();
        setProvider(browserProvider);

        const stakingContract = new ethers.Contract(
          super_showdown_Logic_contract,
          Super_Showdown_Logic,
          signer
        );
        setContract(stakingContract);
      }
      
      // Refresh leaderboard to update UI for new account
      fetchLeaderboard();
    }
  };

  // Add handler for chain changes
  const handleChainChanged = () => {
    // Reload the page when chain changes as recommended by MetaMask
    window.location.reload();
  };

  // Set up event listeners
  useEffect(() => {
    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners on component unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Update loadAccount function
  async function loadAccount() {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      // Check if already connected
      const accounts = await browserProvider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
        setProvider(browserProvider);

        const stakingContract = new ethers.Contract(
          super_showdown_Logic_contract,
          Super_Showdown_Logic,
          signer
        );
        setContract(stakingContract);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching available Account:", error);
      setLoading(false);
    }
  }

  // Update connectWallet function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to participate!");
      return;
    }

    try {
      setLoading(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      await handleAccountsChanged(accounts);
      setLoading(false);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };


  const handleStake = async () => {
    try {
    console.log(super_showdown_Logic_contract)
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
      const stakingContract = new ethers.Contract(
        super_showdown_Logic_contract,
        Super_Showdown_Logic,
        signer
      );

      const tx = await stakingContract?.stake({
        value: ethers.parseEther("0.1"), // Convert 0.5 CORE to Wei
      });
  
      await tx.wait();
      console.log("Staking successful:", tx.hash);
  
      const response = await fetch(`${api}/api/Ocean/Stake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicKey: account }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to stake");
      }
  
      console.log("Staking successful:", data);
  
      // Fetch updated leaderboard after staking
      fetchLeaderboard();
      setIsStaked(true);
    } catch (error) {
      console.error("Error staking:", error);
    }
  };

  const clearTournamentData = async () => {
    try {
      const response = await fetch(`${api}/api/Ocean/clear-tournament`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to clear tournament data");
      }
  
      console.log("Success:", data.message);
      alert("Tournament data cleared successfully!");
    } catch (error:any) {
      console.error("Error:", error.message);
      alert(`Error clearing data: ${error.message}`);
    }
  };
  
  const handleStartGame = async() => {
    console.log("clcicked")
    router.push(`/tournament/Game.html?publicKey=${account}`)
  }
  const handleEndTournament = async () => {
    if (!contract) {
      console.error("Contract not initialized");
      return;
    }

    try {
      setIsEndingTournament(true);
      
      const tx = await contract.endTournament();
      await tx.wait();
      
      console.log("Tournament ended successfully:", tx.hash);
      clearTournamentData()
      
      // Refresh leaderboard after ending tournament
      await fetchLeaderboard();
    } catch (error) {
      console.error("Error ending tournament:", error);
    } finally {
      setIsEndingTournament(false);
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
        <p className="text-xl text-cyan-200 max-w-2xl mx-auto mb-8">
          Stake your CORE, climb the leaderboard, and claim legendary rewards in
          the ultimate underwater battle
        </p>

        {/* Connected Account Display */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 border border-cyan-500/20"
        >
          <Wallet className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-100">
            {account ? (
              <>
                Connected:
                <span className="ml-2 font-mono text-cyan-300">
                  {`${account.substring(0, 6)}...${account.substring(
                    account.length - 4
                  )}`}
                </span>
              </>
            ) : (
              "No wallet connected"
            )}
          </span>
        </motion.div>
      </motion.div>

      {/* Start Game Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-md mx-auto mb-8"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!account || !isStaked}
          onClick={handleStartGame}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
            ${
              !account || !isStaked
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
            }`}
        >
          {!account ? (
            <>
              Connect Wallet First
              <Wallet className="w-5 h-5" />
            </>
          ) : !isStaked ? (
            "Stake to Play"
          ) : (
            <>
              Start Game
              <Play className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Add End Tournament Button after the staking card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-md mx-auto mb-16"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!account || isEndingTournament}
          onClick={handleEndTournament}
          className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
            ${
              !account || isEndingTournament
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400"
            }`}
        >
          {isEndingTournament ? (
            "Ending Tournament..."
          ) : (
            <>
              End Tournament
              <Flag className="w-5 h-5" />
            </>
          )}
        </motion.button>
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
                {stakeAmount} CORE
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isUserInLeaderboard || isStaked}
              onClick={!account ? connectWallet : handleStake}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all
                ${
                  isUserInLeaderboard || isStaked
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400"
                }`}
            >
              {!account ? (
                <>
                  Connect Wallet
                  <Wallet className="w-5 h-5" />
                </>
              ) : isUserInLeaderboard ? (
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

      {/* Active Players Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="max-w-4xl mx-auto mb-16"
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
          {activePlayers.map((player, index) => (
            <motion.div
              key={player.username}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div
                className={`rounded-lg backdrop-blur-lg border transition-all p-6
                  ${
                    player.username === account
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
                        {player.username}
                      </div>
                      <div className="text-cyan-300 flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        Score: {player.score}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-yellow-400">
                      {(player.score / 100).toFixed(2)} CORE
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

      {/* Waiting Players Section */}
      {waitingPlayers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text">
                Waiting Players
              </span>
            </h2>
            <p className="text-cyan-200">
              Warriors who have staked and are ready to enter the battle
            </p>
          </div>

          <div className="space-y-4">
            {waitingPlayers.map((player, index) => (
              <motion.div
                key={player.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={`rounded-lg backdrop-blur-lg border transition-all p-6
                    ${
                      player.username === account
                        ? "bg-blue-500/20 border-blue-400/50"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg text-cyan-100">
                        {player.username}
                      </div>
                      <div className="text-cyan-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Waiting to Play
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base text-blue-300">
                        Staked {stakeAmount} CORE
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
