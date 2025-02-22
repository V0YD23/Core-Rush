"use client";
import React, { useState,useEffect } from "react";
import axios from "axios";
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
import {ethers,BrowserProvider} from "ethers";
import {Tournament_NFT} from "@/abi/tournament_nft.js"
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
const tournament_nft = "0xdAf27a5C2F1307f3b5703E63229A2E1346278496"
const TournamentLanding = () => {
const api = process.env.NEXT_PUBLIC_BACKEND_API;
  const [hoveredTier, setHoveredTier] = useState("");
  const [loading, setLoading] = useState(true);
  const [provider,setProvider] = useState<BrowserProvider>()
  const [account, setAccount] = useState<string | null>(null);
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
  useEffect(() => {
    loadAccount();
  }, []);
  async function loadAccount(){
    if (!window.ethereum) {
        // toast.error("Please install MetaMask to view available NFTs");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
        setProvider(provider)

      } catch (error) {
        console.error("Error fetching available Account:", error);
      }   
  }
  const ClaimNFT = async() => {
    const resp = await fetch(`https://localhost:8443/current-level?publicKey=${account}`)
    const temp = await resp.json()
    const lev = temp.level
    console.log("level "+lev)
    console.log(typeof(lev))

    const response = await fetch(`${api}/generate-tournament-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: account, latest_cleared_level:lev }),
      });

      if (!response.ok) throw new Error("Failed to generate metadata");
      const { metadata } = await response.json();
      const Type = metadata.attributes[1].value;

      console.log(metadata)
      console.log(Type)

      if (!metadata) throw new Error("Received null metadata");

      const hash = await uploadToIPFS(metadata);
      if (!hash) throw new Error("Failed to upload metadata to IPFS");


      const signer = await provider?.getSigner();
      const Tournament_NFT_Contract  = new ethers.Contract(tournament_nft,Tournament_NFT,signer);


      const tx = await Tournament_NFT_Contract?.mintTournamentNFT(Type,hash);
      await tx.wait();
      console.log("success")




  }



  const uploadToIPFS = async (metadata: any) => {
    try {
      const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"; // Use pinJSONToIPFS for metadata

      const response = await axios.post(url, metadata, {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: "30822c42812cd6ea5b8c",
          pinata_secret_api_key:
            "efa8ce1324868fbe358863c37069edb9542087a67df7ddaf6b61ca10a232081b",
        },
      });

      // Get IPFS hash (CID)
      const ipfsHash = response.data.IpfsHash;
      console.log(`✅ Metadata uploaded! IPFS Hash: ${ipfsHash}`);
      return `ipfs://${ipfsHash}`; // Return IPFS URL
    } catch (error: any) {
      console.error(
        "❌ Error uploading metadata to IPFS:",
        error.response ? error.response.data : error.message
      );
      return null;
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
                onClick={() => scrollToSection("destiny")}
                className="px-8 py-4 bg-transparent rounded-lg text-white font-bold text-lg border border-white/30 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300"
              >
                Play Tournament
              </motion.button>

              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                // onClick={() => scrollToSection("destiny")}
                onClick={()=> ClaimNFT()}
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
                  Play this Tournament
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
