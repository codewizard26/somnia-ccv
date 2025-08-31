# Deployment Guide - 0G Hackathon

This guide will walk you through deploying the Rebase Token Vault project to the 0G network.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ installed
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash`)
- MetaMask or any Web3 wallet
- 0G testnet tokens (get from faucet)

### 2. Environment Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd nft-foundry

# Create environment file
cp .env.example .env
```

Edit `.env` file:
```env
GALILEO_RPC_URL=https://galileo.0g.ai
GALILEO_PRIVATE_KEY=your_private_key_here
```

### 3. Deploy Smart Contracts
```bash
# Make script executable
chmod +x deployTo0G.sh

# Deploy contracts
./deployTo0G.sh
```

The script will:
- Compile all contracts
- Deploy RebaseToken, Pool, and Vault contracts
- Set up permissions
- Deposit initial funds
- Save deployment info to `deployment-info.json`

### 4. Update Frontend Configuration
After deployment, copy the contract addresses from `deployment-info.json` to `frontend/src/config/contracts.ts`:

```typescript
export const CONTRACTS = {
  REBASE_TOKEN: "deployed_rebase_token_address",
  POOL: "deployed_pool_address", 
  VAULT: "deployed_vault_address",
};
```

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🔧 Manual Deployment Steps

If you prefer to deploy manually:

### 1. Compile Contracts
```bash
forge build
```

### 2. Deploy RebaseToken
```bash
forge create src/RebaseToken.sol:RebaseToken \
  --rpc-url https://galileo.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args "Rebase Token" "RBT" \
  0x83eBE7Ceb4916C3Cb86662f65b353E4324390059 \
  0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49 \
  0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4
```

### 3. Deploy Pool
```bash
forge create src/RebaseTokenPool.sol:RebaseTokenPool \
  --rpc-url https://galileo.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  --constructor-args REBASE_TOKEN_ADDRESS [] \
  0x83eBE7Ceb4916C3Cb86662f65b353E4324390059 \
  0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4
```

### 4. Deploy Vault
```bash
forge script script/Deployer.s.sol:VaultDeployer \
  --rpc-url https://galileo.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  --sig "run(address)" REBASE_TOKEN_ADDRESS
```

### 5. Set Permissions
```bash
cast send REBASE_TOKEN_ADDRESS \
  --rpc-url https://galileo.0g.ai \
  --private-key YOUR_PRIVATE_KEY \
  "grantMintAndBurnRole(address)" POOL_ADDRESS
```

## 🌐 Network Configuration

Add 0G Galileo Testnet to your wallet:

- **Network Name**: 0G Galileo Testnet
- **RPC URL**: https://galileo.0g.ai
- **Chain ID**: 2131427466778448014
- **Currency Symbol**: 0G
- **Block Explorer**: https://galileo.0g.ai

## 🧪 Testing the Deployment

### 1. Check Contract Deployment
```bash
# Check if contracts are deployed
cast code REBASE_TOKEN_ADDRESS --rpc-url https://galileo.0g.ai
cast code POOL_ADDRESS --rpc-url https://galileo.0g.ai
cast code VAULT_ADDRESS --rpc-url https://galileo.0g.ai
```

### 2. Test Basic Functions
```bash
# Check total supply
cast call REBASE_TOKEN_ADDRESS "totalSupply()" --rpc-url https://galileo.0g.ai

# Check vault balance
cast call VAULT_ADDRESS "balanceOf(address)" YOUR_ADDRESS --rpc-url https://galileo.0g.ai
```

### 3. Test Frontend
1. Connect your wallet to the 0G network
2. Try depositing a small amount of 0G tokens
3. Check if you receive RBT tokens
4. Try withdrawing RBT tokens

## 📊 Verification

### Contract Verification
After deployment, verify your contracts on the block explorer:

1. Go to https://galileo.0g.ai
2. Search for your contract addresses
3. Verify the source code if needed

### Frontend Verification
1. Check if wallet connection works
2. Verify contract interactions
3. Test deposit/withdraw functionality
4. Check balance updates

## 🚨 Troubleshooting

### Common Issues

1. **"Nonce too low" error**
   - Wait for pending transactions to be mined
   - Check transaction status in block explorer

2. **"Insufficient funds" error**
   - Get more 0G tokens from faucet
   - Check your balance

3. **Contract deployment fails**
   - Verify RPC URL is correct
   - Check private key format
   - Ensure sufficient gas

4. **Frontend not connecting**
   - Check if wallet is connected to 0G network
   - Verify contract addresses are correct
   - Check browser console for errors

### Getting Help
- Check the block explorer for transaction status
- Review contract deployment logs
- Check browser console for frontend errors
- Join 0G community for support

## 📝 Post-Deployment Checklist

- [ ] All contracts deployed successfully
- [ ] Contract addresses updated in frontend
- [ ] Permissions set correctly
- [ ] Initial funds deposited to vault
- [ ] Frontend running without errors
- [ ] Wallet connection working
- [ ] Deposit/withdraw functionality tested
- [ ] Contract verification completed
- [ ] Documentation updated

## 🎉 Ready for Hackathon Submission!

Your Rebase Token Vault is now deployed and ready for the 0G Hackathon submission. Make sure to:

1. Include deployment addresses in your submission
2. Provide a demo video showing the functionality
3. Document any unique features or improvements
4. Share the frontend URL for judges to test

Good luck with your hackathon submission! 🚀 