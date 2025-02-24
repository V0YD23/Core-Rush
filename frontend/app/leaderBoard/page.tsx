"use client"
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star, Medal, Gamepad2, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {  
  Shield, 
  Sword, 
  Flame,
  Zap
} from "lucide-react";
interface Player {
  _id: string;
  username: string;
  games_won: number;
  games_lost: number;
}

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<keyof Pick<Player, 'games_won'>>('games_won');
  const [highlightedPlayer, setHighlightedPlayer] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const api = process.env.NEXT_PUBLIC_BACKEND_API;

  useEffect(() => {
    setMounted(true);
    const fetchLeaderboard = async () => {
      try {
        console.log(api)
        const response = await fetch(`${api}/api/leaderBoard`);
        const data: Player[] = await response.json();
        setLeaderboardData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    const baseClass = "transition-all duration-300 ease-out";
    switch (rank) {
      case 1:
        return <Crown className={`w-8 h-8 text-yellow-400 ${baseClass} animate-float`} />;
      case 2:
        return <Medal className={`w-8 h-8 text-gray-300 ${baseClass} animate-pulse`} />;
      case 3:
        return <Medal className={`w-8 h-8 text-amber-700 ${baseClass} animate-pulse`} />;
      default:
        return <Star className={`w-6 h-6 text-blue-400 ${baseClass} group-hover:rotate-45`} />;
    }
  };

  const sortedLeaderboard = [...leaderboardData].sort((a: Player, b: Player) => {
    return sortOrder === 'desc' 
      ? b[selectedCategory] - a[selectedCategory]
      : a[selectedCategory] - b[selectedCategory];
  });
  // // Sort leaderboard based on selected category and sort order
  // const sortedLeaderboard = [...leaderboard].sort((a, b) => {
  //   return sortOrder === 'desc' 
  //     ? b[selectedCategory] - a[selectedCategory]
  //     : a[selectedCategory] - b[selectedCategory];
  // });

  const rankIcons = [
    <Trophy key="trophy" className="w-8 h-8 text-yellow-300" />,
    <Shield key="shield" className="w-8 h-8 text-silver-300" />,
    <Sword key="sword" className="w-8 h-8 text-amber-600" />
  ];


  const getTrophyColor = (index:any) => {
    const colors = ["from-yellow-400 to-yellow-600", "from-gray-300 to-gray-500", "from-amber-600 to-amber-800"];
    return colors[index] || "from-blue-400 to-blue-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Gamepad2 className="w-16 h-16 text-yellow-400 animate-ping" />
      </div>
    );
  }

  return (
    <div className={`py-12 px-4 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto relative">
        {/* Floating particle effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, index) => (
            <motion.div
              key={`particle-${index}`}
              className={`absolute rounded-full ${
                index % 4 === 0
                  ? "bg-purple-500"
                  : index % 4 === 1
                  ? "bg-red-500"
                  : index % 4 === 2
                  ? "bg-blue-500"
                  : "bg-yellow-500"
              }`}
              style={{
                width: `${6 + Math.random() * 10}px`,
                height: `${6 + Math.random() * 10}px`,
              }}
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                opacity: 0.6
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.6, 0.8, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Tournament Header */}
        <motion.div 
          className="text-center mb-12 bg-gray-800/90 backdrop-blur-md p-6 rounded-xl border-2 border-purple-500/50 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Animated gradient border */}
          <motion.div 
            className="absolute -inset-0.5   rounded-xl blur-sm opacity-70 -z-10"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Championship stars */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-full">
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.div 
                  key={`star-${index}`}
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut"
                  }}
                >
                  <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                </motion.div>
              ))}
            </div>
          </div>

          <motion.h1 
  className="text-6xl font-black mb-4 relative inline-block tracking-wider uppercase"
  style={{
    WebkitTextStroke: "2px rgba(255, 255, 255, 0.8)", // Whitish border effect
  }}
  animate={{
    color: ["#ef4444", "#8b5cf6", "#22c55e", "#f97316"],
    textShadow: [
      "0 0 10px rgba(239, 68, 68, 0.7)",
      "0 0 10px rgba(139, 92, 246, 0.7)",
      "0 0 10px rgba(34, 197, 94, 0.7)",
      "0 0 10px rgba(249, 115, 22, 0.7)"
    ]
  }}
  transition={{
    duration: 8,
    repeat: Infinity,
    ease: "linear",
  }}
>
  LeaderBoard of Champions
</motion.h1>

          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring", 
              stiffness: 260, 
              damping: 20,
              delay: 0.3 
            }}
          >
            <motion.div 
              className="flex justify-center items-center gap-2"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sword className="w-8 h-8 text-red-500" />
              <p className="text-white text-xl">Battle for Glory</p>
              <Shield className="w-8 h-8 text-purple-500" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Category Selector */}
        <motion.div 
          className="bg-gray-800/90 backdrop-blur-lg rounded-xl p-4 mb-8 flex justify-center gap-4 border-2 border-purple-500/70 shadow-lg overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }}
        >
          {/* Ambient glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-blue-600/20"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.button
            onClick={() => setSelectedCategory('games_won')}
            className={`px-4 py-2 rounded-lg font-bold relative overflow-hidden
              ${selectedCategory === 'games_won'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-white hover:bg-purple-700'
              }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Victories
            {selectedCategory === 'games_won' && (
              <motion.div
                className="absolute inset-0 bg-purple-500/30"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
          
          <motion.button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 relative overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {sortOrder === 'desc' ? 
              <ArrowDown className="w-6 h-6" /> : 
              <ArrowUp className="w-6 h-6" />
            }
            <motion.div
              className="absolute inset-0 bg-blue-400/30"
              initial={{ scaleX: 0, originX: 0 }}
              whileHover={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>

        {/* Leaderboard List */}
        <div className="space-y-6">
          <AnimatePresence>
            {sortedLeaderboard.map((player, index) => (
              <motion.div
                key={player._id}
                className="relative group"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                onMouseEnter={() => setHighlightedPlayer(player._id)}
                onMouseLeave={() => setHighlightedPlayer(null)}
              >
                {/* Lightning effect for top player */}
                {index === 0 && (
                  <motion.div 
                    className="absolute -top-2 -left-4 text-yellow-300" 
                    animate={{ 
                      opacity: [1, 0.7, 1],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" />
                  </motion.div>
                )}

                <motion.div
                  className={`
                    ${index < 3 
                      ? 'bg-gray-800/95 border-purple-400/80'  
                      : 'bg-gray-800/85 border-purple-600/40'
                    }
                    backdrop-blur-lg rounded-xl p-6 flex items-center gap-6
                    shadow-lg border-2 relative overflow-hidden
                  `}
                  whileHover={{ 
                    scale: 1.03, 
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(31, 41, 55, 0.98)"
                  }}
                  layout
                >
                  {/* Shimmer effect on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/10 to-transparent"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 1 }}
                  />
                  
                  {/* Rank with trophy effect for top 3 */}
                  <motion.div 
                    className="flex items-center justify-center w-16 h-16 relative"
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ rotate: { duration: 0.5, repeat: Infinity } }}
                  >
                    {index < 3 ? (
                      <motion.div 
                        className={`w-14 h-14 rounded-full bg-gradient-to-b ${getTrophyColor(index)} flex items-center justify-center`}
                        animate={{ boxShadow: ["0 0 5px rgba(255, 255, 255, 0.3)", "0 0 15px rgba(255, 255, 255, 0.6)", "0 0 5px rgba(255, 255, 255, 0.3)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {rankIcons[index]}
                      </motion.div>
                    ) : (
                      <div className="text-2xl font-bold text-gray-400">{index + 1}</div>
                    )}
                  </motion.div>

                  {/* Player Info */}
                  <motion.div 
                    className="flex-1"
                    whileHover={{ x: 5 }}
                  >
                    <h3 className="text-xl font-bold text-white relative inline-block">
                      {player.username}
                      {index < 3 && (
                        <motion.span 
                          className="absolute -top-2 -right-6 text-xs"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {["👑", "🥈", "🥉"][index]}
                        </motion.span>
                      )}
                    </h3>
                  </motion.div>

                  {/* Stats */}
                  <motion.div 
                    className="text-right relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="text-3xl font-bold text-purple-300 victory-counter relative">
                      {player.games_won}
                      <motion.span 
                        className="absolute -top-2 -right-4 text-yellow-300 text-xs opacity-0 group-hover:opacity-100"
                        animate={{ y: [0, -10], opacity: [0, 1, 0] }}
                        transition={{ 
                          duration: 1,
                          repeat: Infinity,
                          repeatDelay: 1
                        }}
                      >
                        +1
                      </motion.span>
                    </div>
                    <div className="text-sm text-blue-300">Victories</div>
                  </motion.div>

                  {/* Flame effect for hot players */}
                  {index < 2 && (
                    <motion.div
                      className="absolute -bottom-2 -right-2"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Flame className="w-6 h-6 text-red-500" />
                    </motion.div>
                  )}
                </motion.div>

                {/* Glow effect for top players */}
                {index < 3 && (
                  <motion.div 
                    className="absolute -inset-1 rounded-xl -z-10 opacity-60 blur-md"
                    style={{
                      background: index === 0 
                        ? "linear-gradient(to right, #ef4444, #f59e0b)" 
                        : index === 1 
                        ? "linear-gradient(to right, #8b5cf6, #3b82f6)" 
                        : "linear-gradient(to right, #f59e0b, #84cc16)"
                    }}
                    animate={{ 
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Styles */}
      <style jsx global>{`
        .shimmer-effect {
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .victory-counter {
          position: relative;
          overflow: hidden;
        }

        .victory-counter::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .group:hover .victory-counter::after {
          transform: translateX(100%);
        }
      `}</style>
    </div>
  );
};

export default LeaderboardPage;
