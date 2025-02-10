import React, { useEffect, useState } from 'react';
import { Trophy, Star, Crown, Sparkles } from 'lucide-react';

interface NFTMintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  autoCloseDelay?: number;
}

const NFTMintPopup = ({ isOpen, onClose, level, autoCloseDelay = 5000 }: NFTMintPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: string; animationDuration: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Generate random confetti pieces
      const newConfetti = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 2 + 1}s`
      }));
      setConfetti(newConfetti);

      // Auto close after delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setConfetti([]);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 
          ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Confetti Animation */}
      {confetti.map(({ id, left, animationDuration }) => (
        <div
          key={id}
          className="absolute top-0 animate-confetti"
          style={{
            left,
            animationDuration,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rotate-45" />
        </div>
      ))}

      {/* Popup Content */}
      <div
        className={`relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-1 transform transition-all duration-300
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        <div className="bg-white rounded-xl p-8 text-center relative overflow-hidden">
          {/* Background Sparkles */}
          <div className="absolute inset-0 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute text-yellow-300 w-12 h-12 animate-spin"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative">
            {/* Trophy Icon */}
            <div className="mb-4 relative">
              <div className="absolute inset-0 animate-ping">
                <Trophy className="w-16 h-16 mx-auto text-yellow-400 opacity-50" />
              </div>
              <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
            </div>

            {/* Level Crown */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
              <span className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                Level {level}
              </span>
              <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
            </div>

            <h2 className="text-2xl font-bold text-purple-600 mb-2">
              Achievement Unlocked!
            </h2>
            <p className="text-gray-600 mb-6">
              Your awesome NFT has been minted successfully!
            </p>

            {/* Stars */}
            <div className="flex justify-center gap-4 mb-6">
              {[...Array(3)].map((_, i) => (
                <Star
                  key={i}
                  className="w-8 h-8 text-yellow-400 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Awesome!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTMintPopup;

// Add these keyframes to your global CSS
const globalStyles = `
@keyframes confetti {
  0% {
    transform: translateY(-100%) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}

.animate-confetti {
  animation: confetti linear forwards;
}
`;