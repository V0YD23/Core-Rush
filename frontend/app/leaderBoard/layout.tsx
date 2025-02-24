"use client"
import React from "react";
import { motion } from "framer-motion";
import { 
  Shield, 
  Sword, 
  Crown, 
  Sparkles, 
  Zap, 
  Flame 
} from "lucide-react";

const ParticleEffect = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${
            i % 4 === 0
              ? "bg-blue-500"
              : i % 4 === 1
              ? "bg-purple-500"
              : i % 4 === 2
              ? "bg-red-500"
              : "bg-yellow-500"
          } opacity-60`}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: (typeof window !== "undefined" ? window.innerHeight : 1000) + 10,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: -10,
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            rotate: 360,
          }}
          transition={{
            duration: 2 + Math.random() * 3,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default function ChildLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const heroVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 font-mono relative overflow-hidden">
        <ParticleEffect />
        
        {/* Floating Game Icons */}
        <div className="absolute inset-0 z-0">
          {/* Large Icons */}
          {[...Array(5)].map((_, i) => {
            const icons = [Shield, Sword, Crown, Sparkles, Flame, Zap];
            const Icon = icons[i % icons.length];
            const colors = ["text-red-500", "text-purple-500", "text-green-500", "text-blue-500", "text-yellow-500"];
            
            return (
              <motion.div
                key={`large-${i}`}
                className="absolute"
                initial={{ 
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                  opacity: 0.2
                }}
                animate={{ 
                  y: [0, -30, 0],
                  rotate: [0, 15, -15, 0],
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                  duration: 10 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Icon className={`${colors[i % colors.length]} w-16 h-16 opacity-30`} />
              </motion.div>
            );
          })}
          
          {/* Medium Icons */}
          {[...Array(8)].map((_, i) => {
            const icons = [Shield, Sword, Crown, Sparkles, Flame, Zap];
            const Icon = icons[(i + 3) % icons.length];
            const colors = ["text-red-500", "text-purple-500", "text-green-500", "text-blue-500", "text-yellow-500"];
            
            return (
              <motion.div
                key={`medium-${i}`}
                className="absolute"
                initial={{ 
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
                  y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1000),
                  opacity: 0.15
                }}
                animate={{ 
                  x: [0, 40, 0],
                  y: [0, -20, 0],
                  rotate: 360,
                  opacity: [0.15, 0.3, 0.15]
                }}
                transition={{
                  duration: 15 + Math.random() * 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Icon className={`${colors[(i + 2) % colors.length]} w-10 h-10 opacity-20`} />
              </motion.div>
            );
          })}
        </div>

        {/* Glowing background pattern */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-blue-900/10 to-transparent"></div>
        
        {/* Grid lines */}
        <div className="absolute inset-0 z-0 opacity-10" 
             style={{
               backgroundImage: "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
               backgroundSize: "100px 100px"
             }}>
        </div>

        <div className="relative z-10">
          <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={heroVariants}
              >
                <motion.div 
                  className="p-1 rounded-lg mb-6"
                  animate={{
                    boxShadow: [
                      "0 0 10px rgba(147, 51, 234, 0.5)",
                      "0 0 20px rgba(239, 68, 68, 0.5)",
                      "0 0 10px rgba(59, 130, 246, 0.5)",
                      "0 0 20px rgba(147, 51, 234, 0.5)"
                    ]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="flex justify-center gap-4 mb-4">
                    <Shield className="text-red-500 w-8 h-8" />
                    <Sword className="text-purple-500 w-8 h-8" />
                    <Crown className="text-green-500 w-8 h-8" />
                  </div>
                </motion.div>
                <main className="w-full glass-panel border-2 border-purple-500/30 rounded-lg p-6 bg-gray-800/70 backdrop-blur-md">
                  {children}
                </main>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .glass-panel {
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.3),
                      0 0 30px rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </>
  );
}