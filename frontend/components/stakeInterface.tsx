"use client"
import React from "react";

interface Props {
  connectWallet: () => Promise<void>;
  isLoading: boolean;
}
const StakeInterface: React.FC<Props> = ({ connectWallet, isLoading }) => {
  return (
    <button
      onClick={connectWallet}
      className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      disabled={isLoading}
    >
      {isLoading ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};

export default StakeInterface;
