"use client"
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserProvider } from 'ethers';
import { Contract } from 'ethers';

// Staking contract ABI (replace with your actual deployed contract ABI)
const STAKING_CONTRACT_ABI = [
	{
		"inputs": [],
		"name": "stake",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Staked",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "Withdrawn",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getContractBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			}
		],
		"name": "getStakedBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "stakedAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Replace with your actual deployed contract address
const STAKING_CONTRACT_ADDRESS = '0x90269a6dE66C0AcEfe817C713b2A17408933B209';

export default function StakingDapp() {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState<BrowserProvider>();
  const [contract, setContract] = useState<Contract>();
  const [stakedBalance, setStakedBalance] = useState('0');
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        setError('Connection failed: ');
        console.error("Connection failed:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  // Fetch staked balance
  const fetchStakedBalance = async (contractInstance:ethers.Contract, userAddress:string) => {
    try {
      const balance = await contractInstance.getStakedBalance(userAddress);
      setStakedBalance(ethers.formatEther(balance));
    } catch (error) {
      setError('Failed to fetch staked balance: ');
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
        value: BigInt(stakeAmount) // Direct wei conversion
      });
      await tx.wait();

      // Refresh balance after staking
      await fetchStakedBalance(contract, address);
      setStakeAmount('');
    } catch (error) {
      setError('Staking failed: ');
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw staked ETH
  const handleWithdraw = async () => {
    if (!contract) {
      setError("Please connect wallet first");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      const tx = await contract.withdraw(BigInt(withdrawAmount));
      await tx.wait();
      
      // Refresh balance after withdrawal
      await fetchStakedBalance(contract, address);
      setWithdrawAmount('');
    } catch (error) {
      setError('Withdrawal failed: ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">ETH Staking</h1>

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
                  {address.substring(0, 6)}...{address.substring(address.length - 4)}
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
      </div>
    </div>
  );
}