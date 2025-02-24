// hooks/useWallet.ts
import { ethers } from "ethers";
import { contractABI } from "../abi/staking.js";
import {NFT} from "../abi/nft.js"
const STAKING_CONTRACT_ABI = contractABI;
const STAKING_CONTRACT_ADDRESS:string = process.env.NEXT_PUBLIC_STAKING_ADDRESS || "";
const NFT_CONTRACT_ABI = NFT;
const NFT_CONTRACT_ADDRESS: string = process.env.NEXT_PUBLIC_NFT_ADDRESS || "";
export const useWallet = (setAddress: Function, setProvider: Function, setContract: Function, setNftContract: Function, fetchStakedBalance: Function, api: string|undefined, setError: Function) => {
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const ethProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethProvider.getSigner();
        const userAddress = await signer.getAddress();

        setAddress(userAddress);
        setProvider(ethProvider);

        const stakingContract = new ethers.Contract(
          STAKING_CONTRACT_ADDRESS,
          STAKING_CONTRACT_ABI,
          signer
        );
        setContract(stakingContract);

        const nftContract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_CONTRACT_ABI,
          signer
        );
        setNftContract(nftContract);

        await fetchStakedBalance(stakingContract, userAddress);

        console.log(userAddress)
        const response = await fetch(`${api}/api/User/create-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: userAddress }),
        });

        if (!response.ok) throw new Error("Failed to Create User");
      } catch (error) {
        setError("Connection failed: " + (error as Error).message);
      }
    } else {
      setError("MetaMask is not installed.");
    }
  };

  return { connectWallet };
};
