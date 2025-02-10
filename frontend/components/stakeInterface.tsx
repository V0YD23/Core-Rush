"use client"
import React from "react";
import { Loader2 } from "lucide-react";
import { Wallet } from "lucide-react";
interface Props {
  connectWallet: () => Promise<void>;
  isLoading: boolean;
}

const StakeInterface: React.FC<Props> = ({ connectWallet, isLoading }) => {
  return (
    <button
    onClick={connectWallet}
    className="w-full px-6 py-3 bg-red-500 hover:bg-red-400 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border-b-4 border-red-700 hover:border-red-500 active:border-b-0 transform active:translate-y-1"
  >
    <Wallet className="w-5 h-5" />
    Connect Wallet
  </button>
  );
};

export default StakeInterface;