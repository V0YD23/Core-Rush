import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Loader2 } from 'lucide-react';

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

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
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      className="bg-gradient-to-r from-rose-800/90 to-orange-600/90 rounded-xl p-6 border-4 border-rose-400 shadow-2xl backdrop-blur-sm"
    >
      <div className="space-y-4">
        <label className="text-sm font-bold text-rose-200">
          Collect Coins
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={gameScore}
            onChange={(e) => setGameScore(e.target.value)}
            placeholder="Amount in ETH"
            className="flex-1 px-4 py-3 bg-rose-50 rounded-xl border-2 border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-300/20 transition-all text-rose-900 placeholder-rose-500"
            min="0"
            step="0.01"
            max={stakedBalance}
          />
          <button
            onClick={handleWithdraw}
            disabled={isLoading || !gameScore || Number(gameScore) <= 0}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center gap-2 border-b-4 border-amber-700 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed active:border-b-0 transform active:translate-y-1"
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
    </motion.div>
  );
};

export default CollectCoins;