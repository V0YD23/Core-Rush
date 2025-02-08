"use client"
import React from "react";
import { Loader2 } from "lucide-react";

interface Props {
  connectWallet: () => Promise<void>;
  isLoading: boolean;
}

const StakeInterface: React.FC<Props> = ({ connectWallet, isLoading }) => {
  return (
    <button
      onClick={connectWallet}
      disabled={isLoading}
      className={`
        group
        relative
        w-full
        px-6
        py-3
        rounded-xl
        bg-gradient-to-r
        from-blue-600
        to-blue-500
        text-white
        font-medium
        shadow-lg
        shadow-blue-500/30
        hover:shadow-blue-500/40
        active:scale-95
        disabled:opacity-70
        disabled:cursor-not-allowed
        transition-all
        duration-200
        ease-in-out
        overflow-hidden
      `}
    >
      <div className="absolute inset-0 bg-white/20 group-hover:translate-y-12 transition-transform duration-300 ease-in-out" />
      
      <div className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5 transition-transform group-hover:scale-110"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.6667 7.33333H5.33333C3.49238 7.33333 2 8.82571 2 10.6667V17.3333C2 19.1743 3.49238 20.6667 5.33333 20.6667H18.6667C20.5076 20.6667 22 19.1743 22 17.3333V10.6667C22 8.82571 20.5076 7.33333 18.6667 7.33333Z"
                className="stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M7.33333 7.33333V4.66667C7.33333 3.78261 7.68452 2.93477 8.30964 2.30964C8.93477 1.68452 9.78261 1.33333 10.6667 1.33333H13.3333C14.2174 1.33333 15.0652 1.68452 15.6904 2.30964C16.3155 2.93477 16.6667 3.78261 16.6667 4.66667V7.33333"
                className="stroke-current"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Connect Wallet</span>
          </>
        )}
      </div>
    </button>
  );
};

export default StakeInterface;