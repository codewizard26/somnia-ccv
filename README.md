# Rebase Token Vault - 0G Hackathon Project

A decentralized interest-bearing vault built on the 0G network that allows users to deposit 0G tokens and earn interest through rebase token mechanics.

## 🚀 Features

- **Interest-Bearing Vault**: Deposit 0G tokens to earn interest
- **Rebase Token Mechanics**: Automatic token rebasing with interest accrual
- **Instant Deposits/Withdrawals**: No lock-up periods
- **Modern Web Interface**: Built with Next.js and Tailwind CSS
- **Wallet Integration**: Seamless wallet connection with RainbowKit
- **0G Network**: Built specifically for the 0G Galileo testnet

## 🏗️ Architecture

### Smart Contracts
- **RebaseToken.sol**: ERC20 token with rebase mechanics
- **Vault.sol**: Interest-bearing vault for deposits
- **RebaseTokenPool.sol**: Pool for managing token liquidity

### Frontend
- **Next.js 14**: React framework with App Router
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi + RainbowKit**: Web3 wallet integration
- **TypeScript**: Type-safe development

## 📋 Prerequisites

- Node.js 18+ 
- Foundry (for smart contract development)
- MetaMask or any Web3 wallet
- 0G testnet tokens

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nft-foundry
```

### 2. Install Dependencies
```bash
# Install Foundry dependencies
forge install

# Install frontend dependencies
cd frontend
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
GALILEO_RPC_URL=https://galileo.0g.ai
GALILEO_PRIVATE_KEY=your_private_key_here
```

### 4. Deploy Smart Contracts
```bash
# Make deployment script executable
chmod +x deployTo0G.sh

# Deploy contracts to 0G testnet
./deployTo0G.sh
```

### 5. Update Frontend Configuration
After deployment, update the contract addresses in `frontend/src/config/contracts.ts`:
```typescript
export const CONTRACTS = {
  REBASE_TOKEN: "deployed_contract_address",
  POOL: "deployed_contract_address", 
  VAULT: "deployed_contract_address",
};
```

### 6. Run the Frontend
```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🎯 How It Works

### 1. Deposit Process
1. Connect your wallet to the 0G network
2. Enter the amount of 0G tokens you want to deposit
3. Click "Deposit" to send tokens to the vault
4. Receive RBT tokens representing your share

### 2. Interest Accrual
- RBT tokens automatically rebase with interest
- Your token balance increases over time
- No additional actions required

### 3. Withdrawal Process
1. Enter the amount of RBT tokens you want to withdraw
2. Click "Withdraw" to convert RBT back to 0G
3. Receive your original deposit plus earned interest

## 🔧 Development

### Smart Contract Development
```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy to local network
forge script script/Deployer.s.sol --rpc-url http://localhost:8545
```

### Frontend Development
```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## 📊 Contract Addresses

After deployment, contract addresses will be saved in `deployment-info.json`:

```json
{
  "network": "0G Galileo Testnet",
  "contracts": {
    "rebaseToken": {
      "address": "0x...",
      "name": "Rebase Token",
      "symbol": "RBT"
    },
    "pool": {
      "address": "0x...",
      "description": "Rebase Token Pool"
    },
    "vault": {
      "address": "0x...",
      "description": "Interest-bearing vault"
    }
  }
}
```

## 🌐 Network Configuration

### 0G Galileo Testnet
- **Chain ID**: 2131427466778448014
- **RPC URL**: https://galileo.0g.ai
- **Currency**: 0G
- **Block Explorer**: https://galileo.0g.ai

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
forge test

# Run specific test file
forge test --match-contract RebaseToken
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Reference

### Vault Functions
- `deposit()`: Deposit 0G tokens to the vault
- `withdraw(uint256 amount)`: Withdraw RBT tokens from the vault
- `balanceOf(address user)`: Get user's vault balance

### RebaseToken Functions
- `transfer(address to, uint256 amount)`: Transfer RBT tokens
- `balanceOf(address user)`: Get user's token balance
- `totalSupply()`: Get total token supply

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Join the 0G community

## 🎉 Hackathon Submission

This project was built for the 0G Hackathon and demonstrates:
- Innovative use of rebase token mechanics
- Seamless user experience
- Modern web3 development practices
- Integration with the 0G network

---

**Built with ❤️ for the 0G Hackathon** 
