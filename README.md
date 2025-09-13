# 🌟 Somnia Smart Vault

A decentralized interest-bearing vault built on the Somnia network that allows users to deposit STT tokens and earn interest through rebase token mechanics.

## 🎉 Deployment Status

### 📋 Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| **RebaseToken** | `0x2432dC3847A04945FD80c0A81B4EbDB7C948D93f` | 🔄 Ready to Deploy |
| **Pool** | `0x430EeeAE58193373241cb2eF0FDA3c97d6474e6e` | 🔄 Ready to Deploy |
| **Vault** | `0x77A5840BBd508B36D49e038B908d62C994fF09fb` | 🔄 Ready to Deploy |

### 🔧 Configuration
- **Network:** Somnia Testnet (Chain ID: 50312)
- **RPC URL:** `https://dream-rpc.somnia.network`
- **Block Explorer:** `https://somnia-testnet.socialscan.io`
- **Native Currency:** STT (Somnia Test Token)

### ✅ Deployment Status
- 🔄 **Ready to Deploy:** Run `./deployToSomnia.sh` to deploy contracts
- 🔄 **Permissions:** Will be granted during deployment
- 🔄 **Test Results:** Test deposit will be performed during deployment
- 🔄 **Frontend:** Contract addresses will be updated after deployment

## 🚀 Features

### Core Features
1. **Interest-Bearing Vault**
   - Deposit STT tokens to earn interest
   - No lock-up periods for deposits/withdrawals
   - Automatic interest calculations

2. **Token Exchange Pool**
   - Deposit native STT tokens to receive rebase tokens at a configurable exchange rate
   - Withdraw STT by burning rebase tokens
   - Stake rebase tokens to earn additional rewards
   - Flexible staking and unstaking
   - Exchange and reward rates configurable by owner

3. **Rebase Token Mechanics**
   - Dynamic balance calculation
   - Automatic token rebasing
   - Interest accrual through rebasing

4. **Advanced Security**
   - Role-based access control
   - Comprehensive audit trails
   - Battle-tested smart contracts

5. **Somnia Network Integration**
   - High-performance blockchain infrastructure
   - Low transaction costs
   - Fast finality

## 📈 Development Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Smart contract development
- [x] Vault UI with deposit/withdraw functionality
- [x] Basic dashboard implementation
- [x] Network integration & switching
- [x] MetaMask integration

### Phase 2: Enhanced Features 🔄
- [ ] Advanced analytics dashboard
- [ ] Performance metrics tracking
- [ ] Historical data visualization
- [ ] Risk assessment system
- [ ] Portfolio management tools

### Phase 3: Advanced Features 🔮
- [ ] Cross-chain integration
- [ ] Multi-token support
- [ ] Advanced governance features
- [ ] Enhanced security features
- [ ] Community features

## 🛠 Quick Start

1. **Clone & Install**
   ```bash
   git clone [repository-url]
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Deploy Contracts**
   - Set up your `.env` file with `PRIVATE_KEY` and `RPC_URL=https://dream-rpc.somnia.network`
   - Run `./deployToSomnia.sh` to deploy contracts to Somnia Testnet
   - Contract addresses will be automatically updated in the frontend

4. **Connect Wallet**
   - Switch to Somnia Testnet (Chain ID: 50312)
   - Get test STT tokens from the Somnia faucet
   - Follow MetaMask setup guide in `METAMASK_SETUP_GUIDE.md`

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md)
- [MetaMask Setup](frontend/METAMASK_SETUP_GUIDE.md)
- [Somnia Network Guide](https://docs.somnia.network)
- [Vault Mechanics](VAULT_MECHANICS.md)
- [Deployment Guide](DEPLOYMENT_SCRIPTS_GUIDE.md)

## 🔗 Links

- [Somnia Documentation](https://docs.somnia.network)
- [Somnia Network](https://somnia.network)
- [Block Explorer](https://somnia-testnet.socialscan.io)

## 🏗 Project Structure

- `/frontend` - Next.js frontend application
- `/src` - Smart contract source code
- `/test` - Contract test suite
- `/script` - Deployment scripts
- `/lib` - External dependencies

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.