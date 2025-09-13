# 🚀 Contract Deployment Guide

This guide walks you through deploying the CCIP Vault contracts to Somnia Testnet and integrating them with the frontend.

## 📋 Prerequisites

1. **Environment Setup**
   ```bash
   # Set your private key (never commit this!)
   export PRIVATE_KEY=your_private_key_here
   
   # Ensure you have Foundry installed
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Somnia Testnet Configuration**
   - **Chain ID**: 50312
   - **RPC URL**: https://dream-rpc.somnia.network
   - **Block Explorer**: https://somnia-testnet.socialscan.io
   - **Native Token**: STT

## 🔨 Deployment Process

### Step 1: Deploy Contracts

Run the deployment script for Somnia Testnet:

```bash
./deploy-somnia.sh
```

This script will:
- Deploy `RebaseToken` contract
- Deploy `Vault` contract
- Deploy `SimpleRebaseTokenPool` contract
- Set up necessary permissions
- Save deployment info to `deployment-info.json`

### Step 2: Update Frontend Configuration

After successful deployment, update the contract addresses in the frontend:

```bash
# Option 1: Automatic update (when prompted by deploy script)
# The script will ask if you want to auto-update the frontend config

# Option 2: Manual update
# Edit frontend/src/config/contracts.ts with the deployed addresses
```

### Step 3: Generate ABIs

Generate the latest contract ABIs for the frontend:

```bash
./generate-abis.sh

# Or from the frontend directory:
cd frontend && npm run generate-abis
```

### Step 4: Test the Integration

Start the frontend development server:

```bash
cd frontend
npm run dev
```

## 📄 Contract Addresses

After deployment, your contracts will be deployed at addresses similar to:

```typescript
export const CONTRACTS = {
    REBASE_TOKEN: "0x...", // RebaseToken contract
    VAULT: "0x...",       // Vault contract  
    POOL: "0x...",        // SimpleRebaseTokenPool contract
};
```

## 🔧 Contract Architecture

### RebaseToken (SRBT)
- **Purpose**: Interest-bearing ERC20 token with governance functionality
- **Features**: 
  - Automatic interest accrual (~5% APY)
  - Governance voting power based on staked amount
  - Cross-chain compatible via CCIP

### Vault
- **Purpose**: Manages STT deposits and RBT minting/burning
- **Features**:
  - Deposit STT to mint RBT
  - Redeem RBT to withdraw STT
  - Interest rate management

### SimpleRebaseTokenPool  
- **Purpose**: Staking pool for governance participation
- **Features**:
  - Stake RBT tokens for governance power
  - Unstake tokens anytime
  - Voting weight calculation
  - Reward distribution (future implementation)

## 🎯 Frontend Features

### Vault Operations
- **Deposit**: Convert STT to interest-bearing RBT
- **Withdraw**: Convert RBT back to STT
- **Balance Tracking**: Real-time balance updates

### Governance & Staking
- **Stake RBT**: Lock tokens for governance participation
- **Unstake RBT**: Withdraw staked tokens
- **Governance Power**: Visual representation of voting influence
- **Voting Weight**: Percentage of total staked tokens
- **APY Display**: Estimated annual percentage yield

### Real-time Data
- User balances (STT, RBT, Staked RBT)
- Vault statistics (total deposits, supply)
- Governance metrics (voting power, weight)
- Protocol statistics (total staked, reward rates)

## 🛠 Development Commands

```bash
# Build contracts
forge build

# Run tests
forge test

# Deploy to Somnia Testnet
./deploy-somnia.sh

# Generate ABIs
./generate-abis.sh

# Start frontend
cd frontend && npm run dev
```

## 🔍 Verification

After deployment, verify:

1. ✅ All contracts deployed successfully
2. ✅ Roles and permissions set correctly
3. ✅ Frontend can read contract data
4. ✅ Deposit/withdraw functionality works
5. ✅ Staking/unstaking functionality works
6. ✅ Governance power calculations are correct

## 🚨 Important Notes

- **Private Key Security**: Never commit your private key to version control
- **Testnet Tokens**: Ensure you have STT tokens for testing
- **Gas Fees**: Somnia has very low gas fees, but ensure you have some STT for transactions
- **Contract Verification**: The deployment script includes verification on the block explorer

## 📞 Support

If you encounter issues:

1. Check the deployment logs for error messages
2. Verify your environment variables are set correctly
3. Ensure you have sufficient STT balance for deployment
4. Check the Somnia Testnet status and RPC connectivity

## 🎉 Success!

Once deployed and configured, users can:
- Deposit STT to earn interest via RBT tokens
- Stake RBT tokens to participate in governance
- View their governance power and voting weight
- Participate in protocol decision-making
- Earn staking rewards (when implemented)

The system provides a complete DeFi experience with yield generation and governance participation on the Somnia blockchain.
