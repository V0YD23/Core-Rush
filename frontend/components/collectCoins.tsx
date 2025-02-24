// components/CollectCoins.tsx
import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";

interface CollectCoinsProps {
  gameScore: string;
  setGameScore: (value: string) => void;
  handleWithdraw: () => void;
  isLoading: boolean;
  stakedBalance: string;
}

const CollectCoins: React.FC<CollectCoinsProps> = ({
  gameScore,
  setGameScore,
  handleWithdraw,
  isLoading,
  stakedBalance,
}) => {
  return (
    <div className="bg-white/90 rounded-xl p-6 border-4 border-red-400 shadow-lg space-y-4">
      <label className="text-sm font-bold text-blue-700">Collect Coins</label>
      <div className="flex gap-2">
        <input
          type="number"
          value={gameScore}
          onChange={(e) => setGameScore(e.target.value)}
          placeholder="Amount in ETH"
          className="flex-1 px-4 py-3 bg-blue-50 rounded-xl border-2 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 transition-all text-blue-700"
          min="0"
          step="0.01"
          max={stakedBalance}
        />
        <button
          onClick={handleWithdraw}
          disabled={isLoading || !gameScore || Number(gameScore) <= 0}
          className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 rounded-xl font-bold text-yellow-900 shadow-lg transition-all duration-200 flex items-center gap-2 border-b-4 border-yellow-500 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 transform active:translate-y-1"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Coins className="w-5 h-5" />
          )}
          Collect
        </button>
      </div>
    </div>
  );
};

export default CollectCoins;
