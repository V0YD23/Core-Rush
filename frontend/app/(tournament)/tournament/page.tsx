"use client"
import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Trophy, Shield, Sword, Crown, Star, Flame, Zap, Gamepad,
  HeartPulse, Brain, Wind
} from "lucide-react";
import { ethers, BrowserProvider } from "ethers";
import { Tournament_NFT } from "@/abi/tournament_nft.js";

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

const PowerMeter = ({ power = 75 }) => {
  return (
    <div className="relative w-32 h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-white">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${power}%` }}
        className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
      />
    </div>
  );
};

const tournament_nft = "0xdAf27a5C2F1307f3b5703E63229A2E1346278496";

const TournamentLanding = () => {
  const api = process.env.NEXT_PUBLIC_BACKEND_API;
  const [hoveredTier, setHoveredTier] = useState("");
  const [loading, setLoading] = useState(true);
  const [provider,setProvider] = useState<BrowserProvider>()
  const [account, setAccount] = useState<string | null>(null);

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.1,
      transition: { 
        duration: 0.2,
        yoyo: Infinity
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const characters = {
    warrior: {
      title: "MEGA WARRIOR",
      description: "CRUSH YOUR ENEMIES WITH BRUTE FORCE!",
      icon: Sword,
      stats: {
        health: 90,
        attack: 85,
        defense: 75,
        speed: 50
      },
      color: "bg-red-600",
      buttonColor: "bg-red-500 hover:bg-red-400"
    },
    mage: {
      title: "ARCANE MASTER",
      description: "UNLEASH DEVASTATING MAGICAL POWER!",
      icon: Brain,
      stats: {
        health: 60,
        attack: 90,
        defense: 40,
        speed: 70
      },
      color: "bg-purple-600",
      buttonColor: "bg-purple-500 hover:bg-purple-400"
    },
    rogue: {
      title: "SHADOW STRIKER",
      description: "STRIKE FROM THE SHADOWS!",
      icon: Wind,
      stats: {
        health: 70,
        attack: 75,
        defense: 50,
        speed: 90
      },
      color: "bg-green-600",
      buttonColor: "bg-green-500 hover:bg-green-400"
    }
  };

  const scrollToSection = (sectionId:string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    if (!window.ethereum) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      setProvider(provider);
    } catch (error) {
      console.error("Error fetching available Account:", error);
    }   
  }

  const ClaimNFT = async() => {
    try {
      const resp = await fetch(`https://localhost:8443/current-level?publicKey=${account}`);
      const temp = await resp.json();
      const lev = temp.level;

      const response = await fetch(`${api}/generate-tournament-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: account, latest_cleared_level: lev }),
      });

      if (!response.ok) throw new Error("Failed to generate metadata");
      const { metadata } = await response.json();
      
      if (!metadata) throw new Error("Received null metadata");

      const hash = await uploadToIPFS(metadata);
      if (!hash) throw new Error("Failed to upload metadata to IPFS");

      const signer = await provider?.getSigner();
      const Tournament_NFT_Contract = new ethers.Contract(tournament_nft, Tournament_NFT, signer);
      
      const tx = await Tournament_NFT_Contract?.mintTournamentNFT(metadata.attributes[1].value, hash);
      await tx.wait();
      console.log("NFT Claimed Successfully!");
    } catch (error) {
      console.error("Error claiming NFT:", error);
    }
  };

  const uploadToIPFS = async (metadata:any) => {
    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            "Content-Type": "application/json",
            pinata_api_key: "30822c42812cd6ea5b8c",
            pinata_secret_api_key: "efa8ce1324868fbe358863c37069edb9542087a67df7ddaf6b61ca10a232081b",
          },
        }
      );
      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-mono relative overflow-hidden">
      <ParticleEffect />

      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={heroVariants}
        className="relative h-screen flex items-center justify-center px-4"
      >
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1
              animate={{
                color: ["#ef4444", "#8b5cf6", "#22c55e", "#f97316"],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-8xl font-black mb-8 tracking-widest"
            >
              TOURNAMENT OF CHAMPIONS
            </motion.h1>

            <motion.div className="flex justify-center gap-8 mb-12">
              <Shield className="text-red-500 w-16 h-16" />
              <Sword className="text-purple-500 w-16 h-16" />
              <Crown className="text-green-500 w-16 h-16" />
            </motion.div>

            <div className="flex justify-center gap-6">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                onClick={() => scrollToSection("characters")}
                className="px-8 py-4 bg-red-500 rounded-lg text-white font-bold text-2xl uppercase border-b-4 border-red-700"
              >
                Choose Your Champion
              </motion.button>

              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                onClick={ClaimNFT}
                className="px-8 py-4 bg-purple-500 rounded-lg text-white font-bold text-2xl uppercase border-b-4 border-purple-700"
              >
                Claim Tournament NFT
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Character Selection */}
      <section id="characters" className="py-24 px-4 relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-6xl font-black text-center text-white mb-20 uppercase"
          >
            Select Your Champion
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(characters).map(([key, character]) => (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05, y: -10 }}
                className={`${character.color} rounded-lg p-8 border-4 border-white`}
              >
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6"
                >
                  <character.icon className="w-16 h-16 text-white mx-auto" />
                </motion.div>

                <h3 className="text-3xl font-black text-white mb-4">
                  {character.title}
                </h3>
                <p className="text-xl text-white mb-6">
                  {character.description}
                </p>

                <div className="space-y-3 mb-6">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div key={stat} className="flex items-center gap-2">
                      <span className="text-white capitalize w-20">{stat}</span>
                      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${value}%` }}
                          className="h-full bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full ${character.buttonColor} text-white font-bold py-4 px-8 rounded-lg text-xl uppercase`}
                >
                  Select Champion
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default TournamentLanding;