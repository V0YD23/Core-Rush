"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Shield,
  Sword,
  Crown,
  Star,
  Flame,
  Zap,
  Waves,
} from "lucide-react";

const ParticleEffect = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-${(i % 3) + 1} h-${(i % 3) + 1} rounded-full ${
            i % 4 === 0
              ? "bg-cyan-400"
              : i % 4 === 1
              ? "bg-blue-400"
              : i % 4 === 2
              ? "bg-teal-400"
              : "bg-sky-400"
          } opacity-${i % 2 ? "60" : "40"}`}
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 10,
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: -10,
            x: Math.random() * window.innerWidth,
            rotate: 360,
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
};
const scrollToSection = (sectionId: any) => {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
};

const TournamentLanding = () => {
  const [hoveredTier, setHoveredTier] = useState("");
  const buttonVariants = {
    initial: {
      scale: 1,
      transition: { duration: 0.3 },
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px rgba(255, 255, 255, 0.3)",
      transition: { duration: 0.3 },
    },
  };
  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  };

  const tiers = {
    bronze: {
      title: "Ocean Warrior",
      description: "Master the depths in the Aqua Arena",
      icon: Shield,
      color: "from-cyan-400 via-cyan-600 to-cyan-900",
      buttonColor:
        "bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700",
      accent: "#22d3ee",
    },
    silver: {
      title: "Storm Bringer",
      description: "Command lightning in the Tempest Battleground",
      icon: Sword,
      color: "from-blue-400 via-blue-600 to-blue-900",
      buttonColor:
        "bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700",
      accent: "#3b82f6",
    },
    gold: {
      title: "Azure Legend",
      description: "Rise to godhood in the Celestial Arena",
      icon: Crown,
      color: "from-sky-400 via-sky-600 to-sky-900",
      buttonColor:
        "bg-gradient-to-r from-sky-400 to-sky-600 hover:from-sky-500 hover:to-sky-700",
      accent: "#0ea5e9",
    },
  };

{/* Add this function to your component */}
const scrollToSection = (sectionId:any) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-blue-950 to-cyan-950 overflow-hidden font-[Cinzel]">
      <ParticleEffect />

      <motion.section
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        className="relative  h-screen flex items-center justify-center text-center px-4"
      >
        <div className="absolute  inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 0.9, 0.8],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center opacity-20"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/70 to-cyan-950"></div>
          </motion.div>
        </div>

        <div className="relative  z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
            }}
            className="relative"
          >
            <motion.div
              animate={{
                textShadow: [
                  "0 0 20px #22d3ee",
                  "0 0 40px #22d3ee",
                  "0 0 20px #22d3ee",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-7xl md:text-8xl font-bold text-white mb-8 tracking-wider"
            >
              Aqua Legends
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, ease: "easeOut" }}
              className="text-2xl md:text-3xl text-cyan-100 mb-12 font-[Spectral]"
            >
              Dive into the mystical waters of Aquaria, where legendary warriors
              wield Sacred NFTs in epic battles
            </motion.p>

            <motion.div
              className="flex justify-center gap-8 mb-12"
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Waves className="text-cyan-400 w-12 h-12" />
              <Trophy className="text-blue-400 w-12 h-12" />
              <Sparkles className="text-sky-400 w-12 h-12" />
            </motion.div>

            <motion.div className="flex justify-center gap-6">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                onClick={() => scrollToSection("tournament")}
                className="px-8 py-4 bg-transparent rounded-lg text-white font-bold text-lg border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
              >
                Play Tournament
              </motion.button>

              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                onClick={() => scrollToSection("destiny")}
                className="px-8 py-4 bg-transparent rounded-lg text-white font-bold text-lg border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
              >
                Claim NFTs
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Add these sections to enable smooth scrolling */}

      <section id="destiny" className="py-24 px-4 relative">
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ duration: 1.2 }}
    className="max-w-6xl mx-auto"
  >
    <motion.h2
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="text-5xl md:text-6xl font-bold text-center text-cyan-100 mb-20"
    >
            Choose Your Destiny
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            {Object.entries(tiers).map(([key, tier]) => (
              <motion.div
                key={key}
                whileHover={{
                  scale: 1.05,
                  y: -15,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onHoverStart={() => setHoveredTier(key)}
                onHoverEnd={() => setHoveredTier("")}
                className={`relative overflow-hidden rounded-xl p-8 bg-gradient-to-br ${tier.color} backdrop-blur-xl border border-opacity-30 border-cyan-200`}
                style={{
                  boxShadow:
                    hoveredTier === key ? `0 0 40px ${tier.accent}` : "none",
                }}
              >
                <motion.div
                  className="absolute top-4 right-4"
                  animate={{
                    rotate: hoveredTier === key ? 360 : 0,
                    scale: hoveredTier === key ? 1.3 : 1,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <tier.icon className="w-10 h-10 text-cyan-100" />
                </motion.div>

                <h3 className="text-3xl font-bold text-cyan-100 mb-6">
                  {tier.title}
                </h3>
                <p className="text-xl text-cyan-200 mb-8 font-[Spectral]">
                  {tier.description}
                </p>

                <motion.button
                  className={`w-full ${tier.buttonColor} text-white font-bold py-4 px-8 rounded-lg text-lg`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  Claim Your NFT
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="py-24 px-4 bg-blue-950 bg-opacity-50 relative">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-bold text-cyan-100 mb-20"
          >
            Legendary Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Ocean Battles",
                description: "Command the tides in epic underwater tournaments",
                icon: Sword,
                color: "from-cyan-800 via-cyan-900 to-cyan-950",
              },
              {
                title: "Mythic Rewards",
                description: "Collect sacred artifacts and legendary tokens",
                icon: Star,
                color: "from-blue-800 via-blue-900 to-blue-950",
              },
              {
                title: "Divine Evolution",
                description: "Transform your warrior with each victory",
                icon: Sparkles,
                color: "from-sky-800 via-sky-900 to-sky-950",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.3, ease: "easeOut" }}
                whileHover={{
                  scale: 1.05,
                  y: -15,
                }}
                className={`p-8 rounded-xl bg-gradient-to-br ${feature.color} backdrop-blur-xl border border-opacity-30 border-cyan-200`}
              >
                <motion.div
                  whileHover={{
                    rotate: 360,
                    scale: 1.2,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <feature.icon className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                </motion.div>
                <h3 className="text-2xl font-bold text-cyan-100 mb-4">
                  {feature.title}
                </h3>
                <p className="text-xl text-cyan-200 font-[Spectral]">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default TournamentLanding;
