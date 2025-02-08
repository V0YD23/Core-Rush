"use client";
import React from "react";
import { useState } from "react";
import { ethers } from "ethers";
import { BrowserProvider } from "ethers";
import { Contract } from "ethers";
import { contractABI } from "../abi/core.js";

const STAKING_CONTRACT_ABI = contractABI;

// Replace with your actual deployed contract address
const STAKING_CONTRACT_ADDRESS = "0x74963eD02E9471bd156FB565A095D4172E861a07";

interface WalletConnectProps {
  provider: BrowserProvider | undefined;
  setProvider: React.Dispatch<
    React.SetStateAction<BrowserProvider | undefined>
  >;
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

const walletConnect: React.FC<WalletConnectProps> = ({
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
  const [estimatedProfit,setEstimatedProfit] = useState(0);

  const estimateProfit = async() => {
    const apiKey = "YOUR_COINMARKETCAP_API_KEY"; // Replace with your API Key
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=CORE`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "X-CMC_PRO_API_KEY": apiKey }
        });

        const data = await response.json();
        if (data && data.data && data.data.CORE) {
            return data.data.CORE.quote.USD.price;
        } else {
            throw new Error("Invalid response data");
        }
    } catch (error) {
        console.error("❌ Failed to fetch Core Token price:", error);
        return null;
    }
  }
  // Connect wallet function
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        setIsLoading(true);
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const userAddress = await signer.getAddress();

        setAddress(userAddress);
        setProvider(ethProvider);

        // Create contract instance
        const stakingContract = new ethers.Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer
        );
        setContract(stakingContract);

        // Fetch initial staked balance
        await fetchStakedBalance(stakingContract, userAddress);
      } catch (error) {
        setError("Connection failed: ");
        console.error("Connection failed:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  // Fetch staked balance
  const fetchStakedBalance = async (
    contractInstance: ethers.Contract,
    userAddress: string
  ) => {
    try {
      const balance = await contractInstance.getStakedBalance(userAddress);
      setStakedBalance(ethers.formatEther(balance));
    } catch (error) {
      setError("Failed to fetch staked balance: ");
    }
  };

  // Stake ETH
  const handleStake = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const tx = await contract.stake({
        value: BigInt(stakeAmount), // Direct wei conversion
      });
      await tx.wait();

      // Refresh balance after staking
      await fetchStakedBalance(contract, address);
      setStakeAmount("");
    } catch (error) {
      setError("Staking failed: ");
    } finally {
      setIsLoading(false);
    }
  };
  const toHex = (decimalString:any) => "0x" + BigInt(decimalString).toString(16);
  // Withdraw staked ETH
  const handleWithdraw = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // 🔹 Step 1: Request proof from backend
      const response = await fetch("https://localhost:8443/generate-proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ finalScore: Number(withdrawAmount) }),
      });

      if (!response.ok) throw new Error("Failed to fetch proof");

      
      const { calldata } = await response.json(); // ✅ Now calldata is an array
      
      console.log("✅ Calldata:", calldata);
      
      // Extract values
      const a = calldata[0];
      const b = calldata[1];
      const c = calldata[2];
      const input = calldata[3];
      
      console.log("a:", a);
      console.log("b:", b);
      console.log("c:", c);
      console.log("input:", input);
      try {
        console.log("Sending proof to contract...");
        const tx = await contract.withdraw(a, b, c, input);
        await tx.wait();
        console.log("✅ Withdrawal successful!");
      } catch (error) {
        console.error("❌ Transaction failed:", error);
      }
      
      // Refresh balance
      await fetchStakedBalance(contract, address);
      setWithdrawAmount("");
    } catch (error) {
      console.error("❌ Withdrawal failed:", error);
      setError("Withdrawal failed: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Wallet Connection */}
      {!address ? (
        <button
          onClick={connectWallet}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <>
          {/* Connected Address */}
          <div className="mb-4">
            <p className="text-sm">
              Connected Address:
              <span className="text-green-400 ml-2">
                {address.substring(0, 6)}...
                {address.substring(address.length - 4)}
              </span>
            </p>
          </div>

          {/* Staked Balance */}
          <div className="mb-4 bg-gray-700 p-4 rounded-lg">
            <p className="text-lg">
              Your Staked Balance:
              <span className="font-bold text-green-400 ml-2">
                {stakedBalance} ETH
              </span>
            </p>
          </div>

          {/* Stake Input */}
          <div className="mb-4">
            <label className="block mb-2">Stake ETH</label>
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
                disabled={isLoading || !stakeAmount}
                className="bg-green-600 px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:opacity-50"
              >
                Stake
              </button>
            </div>
          </div>

          {/* Withdraw Input */}
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
                disabled={isLoading || !withdrawAmount}
                className="bg-red-600 px-4 py-2 rounded-r-lg hover:bg-red-700 disabled:opacity-50"
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Error Handling */}
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

export default walletConnect;
