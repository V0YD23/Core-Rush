import { BrowserProvider } from "ethers"; // Import if using ethers.js

export interface WalletConnectProps {
  provider: BrowserProvider | undefined;
  setProvider: React.Dispatch<React.SetStateAction<BrowserProvider | undefined>>;
  address: string;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  stakeAmount: string;
  setStakeAmount: React.Dispatch<React.SetStateAction<string>>;
}
