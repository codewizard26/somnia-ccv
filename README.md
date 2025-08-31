# 🌟 0G Smart Vault

A decentralized interest-bearing vault built on the 0G network that allows users to deposit 0G tokens and earn interest through rebase token mechanics.

## 🎉 Deployment Status

### 📋 Contract Addresses

| Contract | Address | Status |
|----------|---------|--------|
| **RebaseToken** | `0xE4aD0ADAf7E5759569081dF90fC76381eD70A2B5` | ✅ Deployed |
| **Pool** | `0x6c1FEDA3Ace971Ba274BC5b5622acC08Ad2A872C` | ✅ Deployed |
| **Vault** | `0x1a89Be0B6e08B8cF668B36c6F95f9781ABC917ba` | ✅ Deployed |

### 🔧 Configuration
- **Network:** 0G Galileo Testnet (Chain ID: 2131427466778448014)
- **Router:** `0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4`
- **RNM Proxy:** `0x83eBE7Ceb4916C3Cb86662f65b353E4324390059`
- **Link Token:** `0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49`

### ✅ Deployment Status
- ✅ **Permissions:** All roles granted correctly
- ✅ **Test Results:** Successful deposit of 0.1 0G tokens
- ✅ **Frontend:** Contract addresses updated
- ✅ **Network:** Proper chain detection & switching

## 🚀 Features

### Core Features
1. **Interest-Bearing Vault**
   - Deposit 0G tokens to earn interest
   - No lock-up periods for deposits/withdrawals
   - Automatic interest calculations

2. **Rebase Token Mechanics**
   - Dynamic balance calculation
   - Automatic token rebasing
   - Interest accrual through rebasing

3. **Advanced Security**
   - Immutable snapshots on 0G Storage
   - Comprehensive audit trails
   - Bank-grade security features

4. **AI-Powered Analytics**
   - Real-time analytics dashboard
   - Risk insights and monitoring
   - Performance tracking
   
### Technical Implementation
- **Snapshot System**
  - JSON snapshots stored on 0G Storage
  - Immutable proof generation
  - Instant access to historical data

- **Analytics Processing**
  - Data aggregation via 0G Compute
  - Real-time metrics calculation
  - AI-powered risk assessment

## 📈 Development Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Smart contract development
- [x] Vault UI with deposit/withdraw functionality
- [x] Basic dashboard implementation
- [x] Network integration & switching
- [x] MetaMask integration

### Phase 2: 0G Storage Integration 🔄
- [ ] Snapshot system implementation
- [ ] IPFS/0G Storage integration
- [ ] Historical data tracking
- [ ] Proof generation system
- [ ] Transaction history with proofs

### Phase 3: Analytics Platform 🔮
- [ ] 0G Compute integration
- [ ] Advanced analytics dashboard
- [ ] Performance metrics
- [ ] Risk assessment system
- [ ] AI-powered insights

### Phase 4: Advanced Features 🔮
- [ ] Cross-chain integration (CCIP)
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

3. **Connect Wallet**
   - Switch to 0G Galileo Testnet
   - Use the provided faucet to get test tokens
   - Follow MetaMask setup guide in `METAMASK_SETUP_GUIDE.md`

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md)
- [MetaMask Setup](frontend/METAMASK_SETUP_GUIDE.md)
- [0G Connection Guide](frontend/0G_CONNECTION_GUIDE.md)
- [Vault Mechanics](VAULT_MECHANICS.md)
- [Deployment Guide](DEPLOYMENT_SCRIPTS_GUIDE.md)

## 🔗 Links

- [Documentation](https://docs.0g.ai)
- [GitHub](https://github.com/0g-ai)
- [Twitter](https://twitter.com/0g_protocol)
- [Discord](https://discord.gg/0g)

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