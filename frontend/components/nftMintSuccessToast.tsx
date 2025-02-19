import React from "react";
import { Trophy, CheckCircle2 } from "lucide-react"; // Ensure Lucide icons are installed

interface NFTMintSuccessToastProps {
  level: number | string; // Adjust type as needed
}

const NFTMintSuccessToast: React.FC<NFTMintSuccessToastProps> = ({ level }) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/90 to-purple-600/90 rounded-xl border-2 border-blue-400 shadow-lg backdrop-blur-sm">
    <div className="flex-shrink-0">
      <Trophy className="w-6 h-6 text-yellow-300 animate-float" />
    </div>
    <div className="flex-1">
      <p className="font-bold text-white">NFT Minted!</p>
      <p className="text-sm text-blue-100">
        Level {level} achievement unlocked
      </p>
    </div>
    <CheckCircle2 className="w-5 h-5 text-blue-200 animate-pulse" />
  </div>
);

export default NFTMintSuccessToast;
