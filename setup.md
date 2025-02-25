
# 🚀 CORE RUSH - Project Setup Guide
Welcome to **CORE RUSH**, a Web3-based tournament gaming platform! Follow these steps to set up the project on your local machine.

---

## ℹ️ Important Backend Information
**PLEASE NOTE:** The backend code in this repository is provided for reference purposes only. The game's GDScript is hardcoded to interact with our hosted backend URL on Render. For convenience and proper functionality, it's advised **not to run the backend locally** with the game. This approach ensures the game works correctly out of the box without additional configuration.

---

## 📌 Prerequisites
Before you begin, make sure you have the following installed:
- **Node.js** (v21.5.0 or later) - [Download Here](https://nodejs.org/)
- **MongoDB** - We are using mongo atlas for this project which is of owner for the testing.
- **MetaMask Wallet** - [Install MetaMask](https://metamask.io/)
- **Pinata IPFS Account** - [Sign Up](https://www.pinata.cloud/)
- **Core Testnet Wallet** - [Get Testnet CORE](https://scan.coredao.org/faucet)
- **Git** (optional but recommended) - [Install Git](https://git-scm.com/downloads)

---

## 📦 1️⃣ Clone the Repository 

```sh
git clone https://github.com/your-repo/core-rush.git
cd core-rush
```

## 📄 2️⃣ Configure Environment Variables

```sh
# Create an environment file from the sample
cp .env.sample .env
```

Edit the `.env` file and update the variables as needed. The backend hosted URL is:
```
https://core-rush.onrender.com
```

## 🔗 3️⃣ Connect Wallet to Core Blockchain

1. Visit [Chainlist.org](https://chainlist.org)
2. Search for "Core" or "Core Blockchain"
3. Connect your MetaMask wallet
4. Click "Add to MetaMask" for either Core Mainnet or Core Testnet depending on your deployment needs
5. Confirm the network addition in your MetaMask popup

## 🔗 4️⃣ Deploy Smart Contracts

1. Navigate to the contracts directory:
```sh
cd smart-contracts/contracts
```

2. Deploy the contracts to Core Testnet/Mainnet using either:
   - **Remix IDE**: Upload the contracts to [Remix](https://remix.ethereum.org/) and deploy using MetaMask connected to Core network
   - **Foundry Commands**: 
   ```sh
   forge create --rpc-url <CORE_RPC_URL> --private-key <YOUR_PRIVATE_KEY> <CONTRACT_NAME>
   ```

3. Make note of the deployed contract addresses for frontend configuration.

## 🖥️ 5️⃣ Run the Frontend

1. Return to the project root directory (if you're in the contracts folder):
```sh
cd ../..
```

2. Install dependencies and start the development server:
```sh
npm install
npm run dev
```

## 🎮 6️⃣ Access the Game

Open your browser and navigate to:
```
http://localhost:3000
```

This will load the home page of the CORE RUSH gaming platform. Connect your Core wallet to start playing!

---
```