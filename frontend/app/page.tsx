"use client";
import React, { useState, useEffect } from "react";
import { BrowserProvider } from "ethers";
import ConnectWallet from "../components/walletConnect";
import {
  Gamepad2,
  Star,
  Trophy,
  Coins,
  Heart,
  Target,
  Crown,
  Layers,
} from "lucide-react";
import Features from "@/utils/Features";
import { useRouter } from "next/navigation";
import GameStats from "@/utils/GameStats";
import { features } from "@/utils/featuresData";
import NavigationButtons from "@/utils/NavigationButtons";
export default function StakingDapp() {
  const [address, setAddress] = useState(
    () =>
      (typeof window !== "undefined" && localStorage.getItem("address")) || ""
  );

  const [provider, setProvider] = useState<BrowserProvider>();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isLeaderboardHovered, setIsLeaderboardHovered] = useState(false);
  const [isNftsHovered, setIsNftsHovered] = useState(false);
  const [isRentHovered, setIsRentHovered] = useState(false);

  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("address", address.toString());
  }, [address]);

  const handleNavigation = (path: string) => {
    router.push(path);
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
            Jump into the staking adventure! Collect coins and power up your
            rewards!
          </p>

          {/* Leaderboard Button */}
          {/* Buttons Container */}
          <NavigationButtons
            isLeaderboardHovered={isLeaderboardHovered}
            setIsLeaderboardHovered={setIsLeaderboardHovered}
            isNftsHovered={isNftsHovered}
            setIsNftsHovered={setIsNftsHovered}
            isRentHovered={isRentHovered}
            setIsRentHovered={setIsRentHovered}
          />
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
                <Star
                  className={`w-12 h-12 text-yellow-400 ${
                    isHovering ? "animate-spin" : ""
                  }`}
                />
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
          <Features features={features} />
        </div>

        {/* Achievement Stats */}
        <GameStats />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }
        .animate-float {
          animation: float 10s infinite;
        }
      `}</style>
    </>
  );
}
