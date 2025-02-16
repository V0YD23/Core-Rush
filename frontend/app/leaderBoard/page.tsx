"use client"
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star, Medal, Gamepad2, ArrowUp, ArrowDown } from 'lucide-react';

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Gamepad2 className="w-16 h-16 text-yellow-400 animate-ping" />
      </div>
    );
  }

  return (
    <div className={`py-12 px-4 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-4xl mx-auto relative">
        {/* Header with enhanced animation */}
        <div className="text-center mb-12 transform transition-all duration-500 hover:scale-105">
          <h1 className="text-6xl font-bold mb-4 relative inline-block">
            <span className="text-yellow-300 animate-colorPulse">Super</span>
            <span className="text-white"> Champions </span>
            <Trophy className="inline-block w-12 h-12 text-yellow-300 animate-float ml-2" />
          </h1>
          <p className="text-white text-xl animate-fadeIn">Battle your way to the top!</p>
        </div>

        {/* Enhanced Category Selector */}
        <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 mb-8 flex justify-center gap-4 transform transition-all duration-300 hover:shadow-2xl">
          <button
            onClick={() => setSelectedCategory('games_won')}
            className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 transform
              ${selectedCategory === 'games_won'
                ? 'bg-yellow-400 text-white scale-110 shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-yellow-300 hover:scale-105 hover:shadow-md'
              }`}
          >
            Games Won
          </button>
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-md"
          >
            {sortOrder === 'desc' ? 
              <ArrowDown className="w-6 h-6 transition-transform duration-300 hover:translate-y-1" /> : 
              <ArrowUp className="w-6 h-6 transition-transform duration-300 hover:-translate-y-1" />
            }
          </button>
        </div>

        {/* Enhanced Leaderboard List */}
        <div className="space-y-4">
          {sortedLeaderboard.map((player: Player, index: number) => (
            <div
              key={player._id}
              className="relative group"
              style={{
                animation: `slideIn 0.5s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={() => setHighlightedPlayer(player._id)}
              onMouseLeave={() => setHighlightedPlayer(null)}
            >
              <div
                className={`
                  bg-white/90 backdrop-blur-lg rounded-xl p-6 flex items-center gap-6
                  transform transition-all duration-500 ease-out
                  ${highlightedPlayer === player._id ? 'scale-105 shadow-2xl translate-x-2' : ''}
                  hover:border-yellow-400 border-4
                  ${index < 3 ? 'border-yellow-400' : 'border-transparent'}
                  group-hover:bg-white/95
                `}
              >
                {/* Enhanced Rank */}
                <div className="flex items-center justify-center w-16 transition-transform duration-300 group-hover:scale-110">
                  {getRankIcon(index + 1)}
                </div>

                {/* Enhanced Player Info */}
                <div className="flex-1 transform transition-all duration-300 group-hover:translate-x-2">
                  <h3 className="text-xl font-bold text-blue-700 group-hover:text-blue-800">{player.username}</h3>
                </div>

                {/* Enhanced Stats */}
                <div className="text-right transform transition-all duration-300 group-hover:scale-110">
                  <div className="text-3xl font-bold text-yellow-500 group-hover:text-yellow-600">
                    {player.games_won}
                  </div>
                  <div className="text-sm text-gray-600 group-hover:text-gray-800">Victories</div>
                </div>
              </div>

              {/* Enhanced Power-up Effects */}
              {index < 3 && (
                <div 
                  className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-xl opacity-0 blur-lg group-hover:opacity-20 transition-all duration-500 ease-out animate-gradient"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-colorPulse {
          animation: colorPulse 3s infinite;
        }

        @keyframes colorPulse {
          0%, 100% { color: #fde047; }
          50% { color: #facc15; }
        }
      `}</style>
    </div>
  );
};

export default LeaderboardPage;

