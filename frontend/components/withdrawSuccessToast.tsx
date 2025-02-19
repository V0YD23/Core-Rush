import React from "react";
import { Coins, CheckCircle2 } from "lucide-react"; // Ensure you have Lucide icons installed

interface WithdrawSuccessToastProps {
  amount: string;
}

const WithdrawSuccessToast: React.FC<WithdrawSuccessToastProps> = ({ amount }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500/90 to-green-600/90 rounded-xl border-2 border-green-400 shadow-lg backdrop-blur-sm">
    <div className="flex-shrink-0">
      <Coins className="w-6 h-6 text-yellow-300 animate-bounce" />
    </div>
    <div className="flex-1">
      <p className="font-bold text-white">Coins Collected!</p>
      <p className="text-sm text-green-100">
        {amount} ETH withdrawn successfully
      </p>
    </div>
    <CheckCircle2 className="w-5 h-5 text-green-200 animate-pulse" />
  </div>
);

export default WithdrawSuccessToast;
