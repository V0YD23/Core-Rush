"use client"
import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Star, Medal, Gamepad2, ArrowUp, ArrowDown } from 'lucide-react';

interface Player {
  _id: string;       // MongoDB Object ID
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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('https://localhost:8443/api/leaderboard');
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
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400 animate-bounce" />;
      case 2:
        return <Medal className="w-8 h-8 text-gray-300" />;
      case 3:
        return <Medal className="w-8 h-8 text-amber-700" />;
      default:
        return <Star className="w-6 h-6 text-blue-400" />;
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
        <Gamepad2 className="w-16 h-16 text-yellow-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-yellow-300">Super</span>
            <span className="text-white"> Champions </span>
            <Trophy className="inline-block w-12 h-12 text-yellow-300 animate-bounce" />
          </h1>
          <p className="text-white text-xl">Battle your way to the top!</p>
        </div>

        {/* Category Selector */}
        <div className="bg-white/90 rounded-xl p-4 mb-8 flex justify-center gap-4">
          <button
            onClick={() => setSelectedCategory('games_won')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedCategory === 'games_won'
                ? 'bg-yellow-400 text-white scale-110'
                : 'bg-gray-200 text-gray-700 hover:bg-yellow-300'
            }`}
          >
            Games Won
          </button>
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
            {sortOrder === 'desc' ? <ArrowDown className="w-6 h-6" /> : <ArrowUp className="w-6 h-6" />}
          </button>
        </div>

        {/* Leaderboard List */}
        <div className="space-y-4">
          {sortedLeaderboard.map((player: Player, index: number) => (
            <div
              key={player._id}
              className="relative group"
              onMouseEnter={() => setHighlightedPlayer(player._id)}
              onMouseLeave={() => setHighlightedPlayer(null)}
            >
              <div
                className={`
                  bg-white/90 rounded-xl p-6 flex items-center gap-6
                  transform transition-all duration-300
                  ${highlightedPlayer === player._id ? 'scale-105 shadow-xl' : ''}
                  hover:border-yellow-400 border-4
                  ${index < 3 ? 'border-yellow-400' : 'border-transparent'}
                `}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-16">
                  {getRankIcon(index + 1)}
                </div>

                {/* Player Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-blue-700">{player.username}</h3>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-500">{player.games_won}</div>
                  <div className="text-sm text-gray-600">Victories</div>
                </div>
              </div>

              {/* Power-up Effects */}
              {index < 3 && (
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 rounded-xl opacity-20 blur group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export default LeaderboardPage;