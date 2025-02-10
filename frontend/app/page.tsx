// "use client";
// import React, { useState } from "react";
// import { ethers } from "ethers";
// import { BrowserProvider } from "ethers";
// import { Contract } from "ethers";
// import { contractABI } from '../abi/core.js';
// import ConnectWallet from '../components/walletConnect';
// import { ArrowUpCircle, Coins, Wallet, TrendingUp } from "lucide-react";

// const STAKING_CONTRACT_ABI = contractABI;
// const STAKING_CONTRACT_ADDRESS = "0x50b53ea0ECd8d571570aB6e1230C066E08e9D190";

// export default function StakingDapp() {
//   const [address, setAddress] = useState<string>("");
//   const [provider, setProvider] = useState<BrowserProvider>();
//   const [contract, setContract] = useState<Contract>();
//   const [stakedBalance, setStakedBalance] = useState<string>("0");
//   const [stakeAmount, setStakeAmount] = useState<string>("");
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");

//   const features = [
//     {
//       icon: <Coins className="w-8 h-8 text-blue-400" />,
//       title: "Secure Staking",
//       description: "Your assets are protected by advanced smart contracts"
//     },
//     {
//       icon: <TrendingUp className="w-8 h-8 text-green-400" />,
//       title: "Attractive Returns",
//       description: "Earn competitive rewards based on your performance"
//     },
//     {
//       icon: <Wallet className="w-8 h-8 text-purple-400" />,
//       title: "Easy Management",
//       description: "Stake and withdraw with just a few clicks"
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
//       {/* Hero Section */}
//       <div className="relative overflow-hidden">
//         {/* Background Animation */}
//         <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
//         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-3xl" />
        
//         <div className="relative px-6 py-12 mx-auto max-w-7xl">
//           <div className="text-center mb-12">
//             <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
//               ETH Staking Platform
//             </h1>
//             <p className="text-xl text-gray-400 max-w-2xl mx-auto">
//               Stake your ETH and earn rewards based on your performance. 
//               The smarter way to grow your assets.
//             </p>
//           </div>

//           {/* Main Staking Card */}
//           <div className="flex flex-col lg:flex-row gap-8 items-start">
//             {/* Staking Interface */}
//             <div className="w-full lg:w-2/3">
//               <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700">
//                 <ConnectWallet
//                   provider={provider}
//                   setProvider={setProvider}
//                   address={address}
//                   setAddress={setAddress}
//                   contract={contract}
//                   setContract={setContract}
//                   isLoading={isLoading}
//                   setIsLoading={setIsLoading}
//                   stakedBalance={stakedBalance}
//                   setStakedBalance={setStakedBalance}
//                   error={error}
//                   setError={setError}
//                   stakeAmount={stakeAmount}
//                   setStakeAmount={setStakeAmount}
//                 />
//               </div>
//             </div>

//             {/* Features Section */}
//             <div className="w-full lg:w-1/3 space-y-6">
//               {features.map((feature, index) => (
//                 <div
//                   key={index}
//                   className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
//                 >
//                   <div className="flex items-center gap-4">
//                     <div className="p-2 bg-gray-700/50 rounded-lg">
//                       {feature.icon}
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-semibold">{feature.title}</h3>
//                       <p className="text-gray-400 text-sm">{feature.description}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Section */}
//       <div className="border-t border-gray-800">
//         <div className="max-w-7xl mx-auto px-6 py-12">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             <div className="bg-gray-800/30 rounded-xl p-6 text-center">
//               <div className="text-3xl font-bold text-blue-400">$10M+</div>
//               <div className="text-gray-400 mt-2">Total Value Locked</div>
//             </div>
//             <div className="bg-gray-800/30 rounded-xl p-6 text-center">
//               <div className="text-3xl font-bold text-green-400">15%</div>
//               <div className="text-gray-400 mt-2">Average APY</div>
//             </div>
//             <div className="bg-gray-800/30 rounded-xl p-6 text-center">
//               <div className="text-3xl font-bold text-purple-400">5000+</div>
//               <div className="text-gray-400 mt-2">Active Stakers</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"
import React, { useState,useEffect } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from '../abi/core.js';
import ConnectWallet from '../components/walletConnect';
import { Gamepad2, Star, Trophy, Coins, Heart, Target } from "lucide-react";

const STAKING_CONTRACT_ABI = contractABI;
const STAKING_CONTRACT_ADDRESS = "0x50b53ea0ECd8d571570aB6e1230C066E08e9D190";

export default function StakingDapp() {
  const [address, setAddress] = useState(() => localStorage.getItem("address") || "");
  const [provider, setProvider] = useState<BrowserProvider>();
  const [stakeAmount, setStakeAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isHovering, setIsHovering] = useState(false);

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
  return (
    <>
    {/* // <div className="min-h-screen bg-gradient-to-b from-sky-400 via-blue-400 to-blue-500 text-white relative overflow-hidden"> */}
      {/* Cloud Background
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 10}s infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            <div className="w-16 h-16 bg-white rounded-full blur-md opacity-80" />
          </div>
        ))}
      </div> */}

      {/* Ground Decoration */}
      <div className="absolute bottom-0 w-full h-16 bg-green-500" />
      <div className="absolute bottom-16 w-full h-4 bg-green-600" />

      <div className="relative px-6 py-12 mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Gamepad2 className="w-16 h-16 text-yellow-300 animate-bounce" />
          </div>
          <h1 className="text-6xl font-bold mb-4 animate-pulse">
            <span className="text-red-500">Super</span>
            <span className="text-yellow-300"> Stake </span>
            <span className="text-blue-700">Bros!</span>
          </h1>
          <p className="text-xl text-blue-900 max-w-2xl mx-auto font-bold">
            Jump into the staking adventure! Collect coins and power up your rewards!
          </p>
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
    {/* // </div> */}
    </>
  );
}