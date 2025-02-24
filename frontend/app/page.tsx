"use client"
import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import WalletCard from "@/components/stakingConsole";
import { Gamepad2, Trophy, Coins, Heart, } from "lucide-react";
import { useRouter } from "next/navigation";
import FeatureSection from "@/components/powerUps";
import ButtonGroup from "@/components/ButtonGroup";
export default function StakingDapp() {
  const [address, setAddress] = useState(() => 
    (typeof window !== "undefined" && localStorage.getItem("address")) || ""
  );
  
  const [provider, setProvider] = useState<BrowserProvider>();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const router = useRouter()


  useEffect(() => {
    localStorage.setItem("address", address.toString());
  }, [address]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };


  return (
    <>
      {/* Ground Decoration */}
      <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-400 to-blue-500 text-white relative">
          {/* Cloud Background */}
          <div className="absolute inset-0 z-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${8 + Math.random() * 10}s infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              >
                <div className="w-16 h-16 bg-white rounded-full blur-md opacity-80" />
              </div>
            ))}
          </div>
          <div className="relative z-10">
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
          {/* Buttons Container */}
          <ButtonGroup handleNavigation={handleNavigation} />
        </div>

        {/* Main Gaming Area */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Staking Console */}
          <WalletCard
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
          {/* Power-Ups Section */}
          <FeatureSection />
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
