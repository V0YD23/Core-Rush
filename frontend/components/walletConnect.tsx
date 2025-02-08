"use client";
import React from "react";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from "../abi/core.js";
import StakeInterface from "../components/stakeInterface";
const STAKING_CONTRACT_ABI = contractABI;
const STAKING_CONTRACT_ADDRESS = "0x74963eD02E9471bd156FB565A095D4172E861a07";

interface WalletConnectProps {
  provider: BrowserProvider | undefined;
  setProvider: React.Dispatch<React.SetStateAction<BrowserProvider | undefined>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  contract: Contract | undefined;
  setContract: React.Dispatch<React.SetStateAction<Contract | undefined>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  stakedBalance: string;
  setStakedBalance: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  stakeAmount: string;
  setStakeAmount: React.Dispatch<React.SetStateAction<string>>;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  provider,
  setProvider,
  address,
  setAddress,
  contract,
  setContract,
  isLoading,
  setIsLoading,
  stakedBalance,
  setStakedBalance,
  error,
  setError,
  stakeAmount,
  setStakeAmount,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [estimatedProfit, setEstimatedProfit] = useState<number | null>(null);
  const [isCalculatingProfit, setIsCalculatingProfit] = useState(false);
  const [expectedScore, setExpectedScore] = useState("");

  // Effect to calculate profit when stake amount or score changes
  useEffect(() => {
    if (stakeAmount && Number(stakeAmount) > 0 && expectedScore && Number(expectedScore) > 0) {
      estimateProfit(Number(stakeAmount), Number(expectedScore));
    } else {
      setEstimatedProfit(null);
    }
  }, [stakeAmount, expectedScore]);

  const estimateProfit = async (stakedAmount: number, score: number) => {
    if (stakedAmount <= 0 || score <= 0) return;
    
    setIsCalculatingProfit(true);

    try {
      const response = await fetch("https://localhost:8443/get-core-price");
      const data = await response.json();
      
      if (data?.price) {
        const corePrice = data.price;
        const referencePrice = 10;  // The price where multiplier = 1
        
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
      setEstimatedProfit(null);
    } finally {
      setIsCalculatingProfit(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true);
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const userAddress = await signer.getAddress();

        setAddress(userAddress);
        setProvider(ethProvider);

        const stakingContract = new ethers.Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer
        );
        setContract(stakingContract);

        await fetchStakedBalance(stakingContract, userAddress);
      } catch (error) {
        setError("Connection failed: " + (error as Error).message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  const fetchStakedBalance = async (
    contractInstance: ethers.Contract,
    userAddress: string
  ) => {
    try {
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

    try {
      setIsLoading(true);
      setError("");

      const tx = await contract.stake({
        value: BigInt(stakeAmount),
      });
      await tx.wait();

      await fetchStakedBalance(contract, address);
      setStakeAmount("");
      setEstimatedProfit(null);
      setExpectedScore("");
    } catch (error) {
      setError("Staking failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("https://localhost:8443/generate-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalScore: Number(withdrawAmount) }),
      });

      if (!response.ok) throw new Error("Failed to fetch proof");
      
      const { calldata } = await response.json();
      const [a, b, c, input] = calldata;
      
      const tx = await contract.withdraw(a, b, c, input);
      await tx.wait();
      
      await fetchStakedBalance(contract, address);
      setWithdrawAmount("");
    } catch (error) {
      setError("Withdrawal failed: " + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!address ? (
        <StakeInterface connectWallet={connectWallet} isLoading={isLoading}/>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-sm">
              Connected Address:
              <span className="text-green-400 ml-2">
                {address.substring(0, 6)}...{address.substring(address.length - 4)}
              </span>
            </p>
          </div>

          <div className="mb-4 bg-gray-700 p-4 rounded-lg">
            <p className="text-lg">
              Your Staked Balance:
              <span className="font-bold text-green-400 ml-2">
                {stakedBalance} ETH
              </span>
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Expected Score (0-100)</label>
            <input
              type="number"
              value={expectedScore}
              onChange={(e) => setExpectedScore(e.target.value)}
              placeholder="Enter your expected score"
              className="w-full px-3 py-2 bg-gray-700 rounded-lg mb-4"
              min="0"
              max="100"
              step="1"
            />

            <label className="block mb-2">Stake ETH</label>
            <div className="flex flex-col gap-2">
              <div className="flex">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Enter amount to stake"
                  className="w-full px-3 py-2 bg-gray-700 rounded-l-lg"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleStake}
                  disabled={
                    isLoading || 
                    !stakeAmount || 
                    Number(stakeAmount) <= 0 || 
                    !expectedScore || 
                    Number(expectedScore) <= 0 || 
                    Number(expectedScore) > 100
                  }
                  className="bg-green-600 px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Stake
                </button>
              </div>
              
              {isCalculatingProfit ? (
                <div className="text-sm text-gray-400">Calculating estimated profit...</div>
              ) : estimatedProfit !== null && Number(stakeAmount) > 0 && Number(expectedScore) > 0 ? (
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-300">Estimated Profit:</p>
                  <p className="text-lg text-green-400 font-bold">
                    {estimatedProfit.toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Based on expected score of {expectedScore} and current market conditions
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2">Withdraw ETH</label>
            <div className="flex">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                className="w-full px-3 py-2 bg-gray-700 rounded-l-lg"
                min="0"
                step="0.01"
                max={stakedBalance}
              />
              <button
                onClick={handleWithdraw}
                disabled={isLoading || !withdrawAmount || Number(withdrawAmount) <= 0}
                className="bg-red-600 px-4 py-2 rounded-r-lg hover:bg-red-700 disabled:opacity-50"
              >
                Withdraw
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-600 text-white p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default WalletConnect;