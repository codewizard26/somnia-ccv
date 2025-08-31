# 🚀 Quick Setup Guide - 0G Hackathon

## ✅ What's Already Done

Your Rebase Token Vault project is now **fully deployed and ready** for the 0G Hackathon!

### 📋 Deployed Contracts
- **RebaseToken**: `0x8DD3FD4DB26Bf1785f14FBb7E9208c9AAfcC77BB`
- **Pool**: `0xd9D6282a0be5DAe8BBc11122537ECe7D78f7a648`
- **Vault**: `0x7BE2cf4977eC591D734b20a768c87A22512D3FaF`

### 🌐 Frontend
- **URL**: http://localhost:3000 (running in background)
- **Features**: Wallet connection, deposit/withdraw, balance display
- **Tech Stack**: Next.js 14, Tailwind CSS, RainbowKit, Wagmi

## 🎯 How to Test

### 1. Access the Frontend
Open your browser and go to: **http://localhost:3000**

### 2. Connect Your Wallet
- Click "Connect Wallet" button
- Make sure your wallet is connected to **0G Galileo Testnet**
- Network details:
  - Chain ID: `2131427466778448014`
  - RPC: `https://galileo.0g.ai`

### 3. Test the Vault
- **Deposit**: Enter amount of 0G tokens to deposit
- **Withdraw**: Enter amount of RBT tokens to withdraw
- **View Balances**: See your native 0G and vault RBT balances

## 🏆 Hackathon Submission Checklist

### ✅ Technical Requirements
- [x] Smart contracts deployed on 0G network
- [x] Functional frontend with wallet integration
- [x] Deposit/withdraw functionality
- [x] Balance display and token information
- [x] Modern UI with Tailwind CSS
- [x] TypeScript for type safety

### 📝 Documentation
- [x] README.md with comprehensive guide
- [x] DEPLOYMENT_GUIDE.md with step-by-step instructions
- [x] SETUP_GUIDE.md (this file)
- [x] Contract addresses documented

### 🎨 Features
- [x] Interest-bearing vault mechanics
- [x] Rebase token system
- [x] Single-chain deployment (no cross-chain complexity)
- [x] Professional UI/UX
- [x] Real-time balance updates

## 🔧 For Demo/Submission

### Demo Script
1. **Introduction**: "This is a Rebase Token Vault built for the 0G Hackathon"
2. **Show Frontend**: "The interface allows users to deposit 0G tokens and earn interest"
3. **Connect Wallet**: "Users connect their wallet to the 0G network"
4. **Demonstrate Deposit**: "Users can deposit 0G tokens and receive RBT tokens"
5. **Show Interest**: "RBT tokens automatically rebase with interest over time"
6. **Demonstrate Withdraw**: "Users can withdraw their tokens plus earned interest"

### Key Points to Highlight
- **Innovation**: Rebase token mechanics for automatic interest
- **User Experience**: Simple, intuitive interface
- **Technical Excellence**: Modern web3 stack with TypeScript
- **0G Integration**: Built specifically for the 0G network
- **Production Ready**: Fully functional with proper error handling

## 🚨 Troubleshooting

### If Frontend Won't Load
```bash
cd frontend
npm install
npm run dev
```

### If Wallet Won't Connect
- Ensure you're on 0G Galileo Testnet
- Add network manually if needed:
  - Network Name: 0G Galileo Testnet
  - RPC URL: https://galileo.0g.ai
  - Chain ID: 2131427466778448014
  - Currency: 0G

### If Transactions Fail
- Check your 0G token balance
- Ensure sufficient gas fees
- Try smaller amounts first

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify network connection
3. Ensure wallet is on correct network
4. Check contract addresses are correct

## 🎉 Ready for Submission!

Your project is now **complete and ready** for the 0G Hackathon submission. The frontend is running, contracts are deployed, and everything is functional.

**Good luck with your hackathon submission!** 🚀 