"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from '../abi/core.js';
import ConnectWallet from '../components/walletConnect';
import { ArrowUpCircle, Coins, Wallet, TrendingUp } from "lucide-react";

const STAKING_CONTRACT_ABI = contractABI;
const STAKING_CONTRACT_ADDRESS = "0x50b53ea0ECd8d571570aB6e1230C066E08e9D190";

export default function StakingDapp() {
  const [address, setAddress] = useState<string>("");
  const [provider, setProvider] = useState<BrowserProvider>();
  const [contract, setContract] = useState<Contract>();
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const features = [
    {
      icon: <Coins className="w-8 h-8 text-blue-400" />,
      title: "Secure Staking",
      description: "Your assets are protected by advanced smart contracts"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-green-400" />,
      title: "Attractive Returns",
      description: "Earn competitive rewards based on your performance"
    },
    {
      icon: <Wallet className="w-8 h-8 text-purple-400" />,
      title: "Easy Management",
      description: "Stake and withdraw with just a few clicks"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent blur-3xl" />
        
        <div className="relative px-6 py-12 mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              ETH Staking Platform
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Stake your ETH and earn rewards based on your performance. 
              The smarter way to grow your assets.
            </p>
          </div>

          {/* Main Staking Card */}
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Staking Interface */}
            <div className="w-full lg:w-2/3">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700">
                <ConnectWallet
                  provider={provider}
                  setProvider={setProvider}
                  address={address}
                  setAddress={setAddress}
                  contract={contract}
                  setContract={setContract}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  stakedBalance={stakedBalance}
                  setStakedBalance={setStakedBalance}
                  error={error}
                  setError={setError}
                  stakeAmount={stakeAmount}
                  setStakeAmount={setStakeAmount}
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="w-full lg:w-1/3 space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-gray-400 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800/30 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400">$10M+</div>
              <div className="text-gray-400 mt-2">Total Value Locked</div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400">15%</div>
              <div className="text-gray-400 mt-2">Average APY</div>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400">5000+</div>
              <div className="text-gray-400 mt-2">Active Stakers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}