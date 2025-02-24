import { useState } from "react";
import { Star } from "lucide-react";
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

  return (
    <div className="w-full lg:w-2/3">
      <div
        className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border-4 border-yellow-400 hover:border-yellow-300 transition-all duration-300"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="mb-6 flex items-center justify-center">
          <Star className={`w-12 h-12 text-yellow-400 ${isHovering ? "animate-spin" : ""}`} />
        </div>
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
  );
};

export default WalletCard;
