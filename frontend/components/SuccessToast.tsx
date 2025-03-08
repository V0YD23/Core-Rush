import React from 'react';
import { motion } from "framer-motion";
import { Coins, Trophy, CheckCircle2, Star, Sparkles } from "lucide-react";

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.9 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { duration: 0.2 }
  }
};

const ShinyParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white rounded-full"
        initial={{
          opacity: 0,
          x: "50%",
          y: "50%"
        }}
        animate={{
          opacity: [0, 1, 0],
          x: ["50%", `${Math.random() * 100}%`],
          y: ["50%", `${Math.random() * 100}%`],
          scale: [1, 0]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          delay: i * 0.2
        }}
      />
    ))}
  </div>
);

export const WithdrawSuccessToast = ({ amount }: { amount: string }) => (
  <motion.div
    variants={toastVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="relative flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-yellow-600/90 to-yellow-800/90 rounded-xl border-2 border-yellow-400 shadow-lg backdrop-blur-sm overflow-hidden"
  >
    <ShinyParticles />
    <div className="relative flex-shrink-0 p-2 bg-yellow-500 rounded-full">
      <Coins className="w-8 h-8 text-white animate-bounce" />
    </div>
    <div className="flex-1 relative">
      <h3 className="font-black text-xl text-yellow-300 mb-1 uppercase tracking-wider">
        Victory Coins Claimed!
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-yellow-200">{amount} CORE</span>
        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
      </div>
    </div>
    <CheckCircle2 className="w-6 h-6 text-yellow-300 animate-pulse" />
  </motion.div>
);

export const NFTMintSuccessToast = ({ level }: { level: number }) => (
  <motion.div
    variants={toastVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="relative flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-purple-700/90 to-blue-900/90 rounded-xl border-2 border-purple-400 shadow-lg backdrop-blur-sm overflow-hidden"
  >
    <ShinyParticles />
    <div className="relative flex-shrink-0 p-2 bg-purple-500 rounded-full">
      <Trophy className="w-8 h-8 text-white animate-[bounce_2s_ease-in-out_infinite]" />
    </div>
    <div className="flex-1 relative">
      <h3 className="font-black text-xl text-purple-300 mb-1 uppercase tracking-wider flex items-center gap-2">
        Level {level} Mastered!
        <Star className="w-5 h-5 text-yellow-300 animate-spin" />
      </h3>
      <p className="text-sm text-purple-200 font-bold">
        Legendary NFT Achievement Unlocked
      </p>
    </div>
    <CheckCircle2 className="w-6 h-6 text-purple-300 animate-pulse" />
  </motion.div>
);

export default {
  WithdrawSuccessToast,
  NFTMintSuccessToast
};