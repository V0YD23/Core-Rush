import { Crown, Trophy, Layers, Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavigationButtonsProps {
  isLeaderboardHovered: boolean;
  setIsLeaderboardHovered: (value: boolean) => void;
  isNftsHovered: boolean;
  setIsNftsHovered: (value: boolean) => void;
  isRentHovered: boolean;
  setIsRentHovered: (value: boolean) => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isLeaderboardHovered,
  setIsLeaderboardHovered,
  isNftsHovered,
  setIsNftsHovered,
  isRentHovered,
  setIsRentHovered
}) => {
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {/* Leaderboard Button */}
      <button
        onClick={() => handleNavigation("/leaderBoard")}
        onMouseEnter={() => setIsLeaderboardHovered(true)}
        onMouseLeave={() => setIsLeaderboardHovered(false)}
        className={`
          relative 
          group 
          px-8 
          py-4 
          bg-gradient-to-r 
          from-yellow-400 
          via-yellow-500 
          to-yellow-400 
          rounded-xl 
          shadow-lg 
          transform 
          hover:scale-105 
          transition-all 
          duration-300
          border-4 
          border-yellow-600
          hover:border-yellow-500
          ${isLeaderboardHovered ? "animate-pulse" : ""}
        `}
      >
        <div className="flex items-center justify-center space-x-3">
          <Crown className={`w-6 h-6 text-white ${isLeaderboardHovered ? "animate-bounce" : ""}`} />
          <span className="text-white font-bold text-xl">View Leaderboard</span>
          <Trophy className={`w-6 h-6 text-white ${isLeaderboardHovered ? "animate-bounce" : ""}`} />
        </div>
      </button>

      {/* View Your NFTs Button */}
      <button
        onClick={() => handleNavigation("/yourNfts")}
        onMouseEnter={() => setIsNftsHovered(true)}
        onMouseLeave={() => setIsNftsHovered(false)}
        className={`
          relative 
          group 
          px-8 
          py-4 
          bg-gradient-to-r 
          from-blue-500 
          via-blue-600 
          to-blue-500 
          rounded-xl 
          shadow-lg 
          transform 
          hover:scale-105 
          transition-all 
          duration-300
          border-4 
          border-blue-700
          hover:border-blue-600
          ${isNftsHovered ? "animate-pulse" : ""}
        `}
      >
        <div className="flex items-center justify-center space-x-3">
          <Layers className={`w-6 h-6 text-white ${isNftsHovered ? "animate-bounce" : ""}`} />
          <span className="text-white font-bold text-xl">View Your NFTs</span>
        </div>
      </button>

      {/* Rent Level NFT Button */}
      <button
        onClick={() => handleNavigation("/rentLevelNft")}
        onMouseEnter={() => setIsRentHovered(true)}
        onMouseLeave={() => setIsRentHovered(false)}
        className={`
          relative 
          group 
          px-8 
          py-4 
          bg-gradient-to-r 
          from-green-500 
          via-green-600 
          to-green-500 
          rounded-xl 
          shadow-lg 
          transform 
          hover:scale-105 
          transition-all 
          duration-300
          border-4 
          border-green-700
          hover:border-green-600
          ${isRentHovered ? "animate-pulse" : ""}
        `}
      >
        <div className="flex items-center justify-center space-x-3">
          <Star className={`w-6 h-6 text-white ${isRentHovered ? "animate-bounce" : ""}`} />
          <span className="text-white font-bold text-xl">Rent Level NFT</span>
        </div>
      </button>
    </div>
  );
};

export default NavigationButtons;
