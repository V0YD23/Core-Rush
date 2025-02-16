"use client"
import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import ConnectWallet from '../components/walletConnect';
import { Gamepad2, Star, Trophy, Coins, Heart, Target, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StakingDapp() {
  const [address, setAddress] = useState(() => 
    (typeof window !== "undefined" && localStorage.getItem("address")) || ""
  );
  
  const [provider, setProvider] = useState<BrowserProvider>();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isLeaderboardHovered, setIsLeaderboardHovered] = useState(false);

  const router = useRouter()
  const features = [
    {
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      title: "Power Star Staking",
      description: "Collect stars to boost your rewards!"
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Extra Life Protection",
      description: "Your coins are safe in our power-up vault"
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: "Bonus Stage Rewards",
      description: "Hit targets for bonus multipliers"
    }
  ];

  useEffect(() => {
    localStorage.setItem("address", address.toString());
  }, [address]);

  const handleLeaderboardClick = () => {
    // Add your leaderboard navigation logic here
    router.push("/leaderBoard")
    console.log("Navigating to leaderboard...");
  };

  return (
    <>
      {/* Ground Decoration */}
      <div className="absolute bottom-0 w-full h-16 bg-green-500" />
      <div className="absolute bottom-16 w-full h-4 bg-green-600" />

      <div className="relative px-6 py-12 mx-auto max-w-7xl">
        {/* Hero Section with Leaderboard Button */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-yellow-300 animate-bounce" />
          </div>
          <h1 className="text-6xl font-bold mb-4 animate-pulse">
            <span className="text-red-500">Super</span>
            <span className="text-yellow-300"> Stake </span>
            <span className="text-blue-700">Bros!</span>
          </h1>
          <p className="text-xl text-blue-900 max-w-2xl mx-auto font-bold mb-8">
            Jump into the staking adventure! Collect coins and power up your rewards!
          </p>
          
          {/* Leaderboard Button */}
          <button
            onClick={handleLeaderboardClick}
            onMouseEnter={() => setIsLeaderboardHovered(true)}
            onMouseLeave={() => setIsLeaderboardHovered(false)}
            className={`
              relative 
              group 
              px-8 
              py-4 
              bg-gradient-to-r 
              from-yellow-400 
              via-yellow-500 
              to-yellow-400 
              rounded-xl 
              shadow-lg 
              transform 
              hover:scale-105 
              transition-all 
              duration-300
              border-4 
              border-yellow-600
              hover:border-yellow-500
              ${isLeaderboardHovered ? 'animate-pulse' : ''}
            `}
          >
            <div className="flex items-center justify-center space-x-3">
              <Crown className={`w-6 h-6 text-white ${isLeaderboardHovered ? 'animate-bounce' : ''}`} />
              <span className="text-white font-bold text-xl">View Leaderboard</span>
              <Trophy className={`w-6 h-6 text-white ${isLeaderboardHovered ? 'animate-bounce' : ''}`} />
            </div>
            {/* Decorative stars */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-300 rounded-full animate-ping" />
          </button>
        </div>

        {/* Main Gaming Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Staking Console */}
          <div className="w-full lg:w-2/3">
            <div 
              className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-4 border-yellow-400 hover:border-yellow-300 transition-all duration-300"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="mb-6 flex items-center justify-center">
                <Star className={`w-12 h-12 text-yellow-400 ${isHovering ? 'animate-spin' : ''}`} />
              </div>
              <ConnectWallet
                provider={provider}
                setProvider={setProvider}
                address={address}
                setAddress={setAddress}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                error={error}
                setError={setError}
                stakeAmount={stakeAmount}
                setStakeAmount={setStakeAmount}
              />
            </div>
          </div>

          {/* Power-Ups Section */}
          <div className="w-full lg:w-1/3 space-y-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-4 border-red-400 hover:scale-105 hover:border-red-300 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-yellow-300 rounded-lg animate-pulse">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-blue-700">{feature.title}</h3>
                    <p className="text-red-500 text-sm font-medium">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="mt-12">
          <div className="max-w-7xl mx-auto py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-500 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300">
                <Coins className="w-12 h-12 text-yellow-300 mx-auto mb-2 animate-bounce" />
                <div className="text-3xl font-bold text-white">$10M+</div>
                <div className="text-yellow-300 mt-2 font-bold">Coins Collected</div>
              </div>
              <div className="bg-green-500 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300">
                <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-2 animate-bounce" />
                <div className="text-3xl font-bold text-white">15%</div>
                <div className="text-yellow-300 mt-2 font-bold">Power-Up Rate</div>
              </div>
              <div className="bg-blue-600 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300">
                <Heart className="w-12 h-12 text-red-500 mx-auto mb-2 animate-bounce" />
                <div className="text-3xl font-bold text-white">5000+</div>
                <div className="text-yellow-300 mt-2 font-bold">Active Players</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        .animate-float {
          animation: float 10s infinite;
        }
      `}</style>
    </>
  );
}

