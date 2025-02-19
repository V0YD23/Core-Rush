import { Coins, Trophy, Heart } from "lucide-react";

const GameStats: React.FC = () => {
  return (
    <div className="mt-12">
      <div className="max-w-7xl mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coins Collected */}
          <div className="bg-red-500 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300">
            <Coins className="w-12 h-12 text-yellow-300 mx-auto mb-2 animate-bounce" />
            <div className="text-3xl font-bold text-white">$10M+</div>
            <div className="text-yellow-300 mt-2 font-bold">Coins Collected</div>
          </div>

          {/* Power-Up Rate */}
          <div className="bg-green-500 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300">
            <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-2 animate-bounce" />
            <div className="text-3xl font-bold text-white">15%</div>
            <div className="text-yellow-300 mt-2 font-bold">Power-Up Rate</div>
          </div>

          {/* Active Players */}
          <div className="bg-blue-600 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 border-4 border-yellow-300">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-2 animate-bounce" />
            <div className="text-3xl font-bold text-white">5000+</div>
            <div className="text-yellow-300 mt-2 font-bold">Active Players</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
