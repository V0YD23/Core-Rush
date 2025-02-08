"use client";
import React, { useState } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from '../abi/core.js';
import ConnectWallet from '../components/walletConnect';  // Assuming ConnectWallet is in the same directory

// Staking contract ABI (replace with your actual deployed contract ABI)
const STAKING_CONTRACT_ABI = contractABI;

// Replace with your actual deployed contract address
const STAKING_CONTRACT_ADDRESS = "0x50b53ea0ECd8d571570aB6e1230C066E08e9D190";

export default function StakingDapp() {
  const [address, setAddress] = useState<string>("");
  const [provider, setProvider] = useState<BrowserProvider>();
  const [contract, setContract] = useState<Contract>();
  const [stakedBalance, setStakedBalance] = useState<string>("0");
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  return (
<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
  <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-lg">
    <h1 className="text-3xl font-bold mb-6 text-center">ETH Staking</h1>

    {/* Pass all necessary hooks as props to the ConnectWallet component */}
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

  );
}
