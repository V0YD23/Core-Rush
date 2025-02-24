import { useState, useEffect } from "react";
import { Star, Shield, Sparkles } from "lucide-react";
import WalletConnect from "./walletConnect";
import { WalletConnectProps } from "@/interfaces/walletConnect.js";

const WalletCard: React.FC<WalletConnectProps> = ({
  provider,
  setProvider,
  address,
  setAddress,
  isLoading,
  setIsLoading,
  error,
  setError,
  stakeAmount,
  setStakeAmount,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);

  // Create a pulsing effect even when not hovering
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(prev => !prev);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  return (
<div className="w-full lg:w-2/3">
  <div
    className={`bg-sky-700 rounded-3xl p-8 shadow-xl border-4 ${
      isHovering ? "border-white/80 shadow-white/30" : "border-white/50"
    } transition-all duration-300 relative overflow-hidden`}
    onMouseEnter={() => setIsHovering(true)}
    onMouseLeave={() => setIsHovering(false)}
    style={{
      boxShadow: isHovering ? "0 0 20px 5px rgba(255, 255, 255, 0.2)" : "",
    }}
  >
    {/* Animated background elements - cloud-like shapes */}
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="absolute bg-white rounded-full opacity-20"
          style={{
            width: `${Math.random() * 80 + 40}px`,
            height: `${Math.random() * 80 + 40}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `float ${5 + index * 2}s infinite ease-in-out alternate`,
          }}
        ></div>
      ))}
    </div>
    
    {/* Main content */}
    <div className="relative z-10">
      <div className="mb-6 flex items-center justify-center">
        <div className={`relative ${pulseEffect ? "scale-110" : "scale-100"} transition-all duration-700`}>
          <Shield className={`w-16 h-16 text-white ${isHovering ? "animate-pulse" : ""}`} />
          <Star
            className={`absolute -top-2 -right-2 w-8 h-8 text-sky-200 ${isHovering ? "animate-spin" : ""}`}
          />
          <Sparkles
            className={`absolute bottom-0 right-0 w-6 h-6 text-sky-100 ${isHovering ? "animate-pulse" : "opacity-0"}`}
          />
        </div>
      </div>
      
      <div className="text-center mb-4">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
          Connect Your Arsenal
        </h2>
        <p className="text-sky-100 text-sm">Access your crypto power</p>
      </div>
      
      <div className={`p-4 rounded-2xl bg-sky-800/70 backdrop-blur-sm ${isHovering ? "border-2 border-white/70" : ""} transition-all duration-300`}>
        <WalletConnect
          provider={provider}
          setProvider={setProvider}
          address={address}
          setAddress={setAddress}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          error={error}
          setError={setError}
          stakeAmount={stakeAmount}
          setStakeAmount={setStakeAmount}
        />
      </div>
    </div>
  </div>
</div>
  );
};

export default WalletCard;