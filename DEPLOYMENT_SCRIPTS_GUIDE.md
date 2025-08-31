# 🔧 **Fixed Deployment Scripts Guide**

## 📋 **Available Deployment Scripts:**

### **1. `deploy-working.sh` (Recommended)**
- **Purpose:** Clean, reliable deployment script
- **Features:** Better error handling, clear output, comprehensive testing
- **Output:** `deployment-working.json`

### **2. `deployTo0G.sh` (Fixed Original)**
- **Purpose:** Fixed version of the original script
- **Features:** Same functionality as original but with fixes
- **Output:** `deployment-to0g.json`

## 🚀 **How to Use:**

### **Prerequisites:**
1. **Environment Setup:**
   ```bash
   # Create .env file with:
   GALILEO_RPC_URL=https://evmrpc-testnet.0g.ai
   GALILEO_PRIVATE_KEY=your_private_key_here
   ```

2. **Install Foundry:**
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   source ~/.zshrc
   foundryup
   ```

### **Deployment Steps:**

#### **Option 1: Use the Working Script (Recommended)**
```bash
./deploy-working.sh
```

#### **Option 2: Use the Fixed Original Script**
```bash
./deployTo0G.sh
```

## 🔧 **Key Fixes Applied:**

### **1. Fixed "Dry Run" Issue:**
- **Problem:** `forge create` was running in dry run mode
- **Solution:** Used `cast send --create` instead
- **Result:** Transactions are actually broadcast to the network

### **2. Fixed ABI Encoding:**
- **Problem:** Empty arrays not encoded correctly
- **Solution:** Used `"[]"` instead of `"0x"` for empty arrays
- **Result:** Constructor arguments are properly encoded

### **3. Fixed Address Extraction:**
- **Problem:** Address extraction was failing
- **Solution:** Used `grep "contractAddress" | awk '{print $2}'`
- **Result:** Contract addresses are properly extracted

### **4. Added Error Handling:**
- **Problem:** Scripts failed silently
- **Solution:** Added validation and error messages
- **Result:** Clear feedback when something goes wrong

### **5. Added Permission Setting:**
- **Problem:** Vault didn't have mint permissions
- **Solution:** Automatically grant mint/burn role to both Pool and Vault
- **Result:** All contracts work together properly

### **6. Added Test Deposit:**
- **Problem:** No verification that deployment worked
- **Solution:** Test deposit after deployment
- **Result:** Confirmation that everything is working

## 📊 **What Each Script Does:**

### **Step-by-Step Process:**
1. **Load Environment Variables** - Check for required variables
2. **Compile Contracts** - Build all smart contracts
3. **Deploy RebaseToken** - Deploy the interest-bearing token
4. **Deploy Pool** - Deploy the cross-chain pool
5. **Deploy Vault** - Deploy the main vault contract
6. **Set Permissions** - Grant mint/burn roles
7. **Test Deposit** - Verify everything works
8. **Save Info** - Create deployment JSON file

### **Contract Addresses Generated:**
- **RebaseToken:** Interest-bearing token contract
- **Pool:** Cross-chain functionality (for future use)
- **Vault:** Main vault that accepts 0G deposits

## 🧪 **Testing the Deployment:**

### **After Deployment:**
1. **Check the JSON file** for contract addresses
2. **Update frontend config:**
   ```bash
   # Edit frontend/src/config/contracts.ts
   # Update the addresses with the new ones
   ```
3. **Test the frontend:**
   ```bash
   cd frontend && npm run dev
   ```

### **Manual Testing:**
```bash
# Check contract deployment
cast call 0xREBASE_TOKEN_ADDRESS "name()" --rpc-url $GALILEO_RPC_URL

# Check vault balance
cast call 0xVAULT_ADDRESS "getVaultBalance()" --rpc-url $GALILEO_RPC_URL

# Test deposit (small amount)
cast send 0xVAULT_ADDRESS --value 100000000000000000 "deposit()" --rpc-url $GALILEO_RPC_URL --private-key $GALILEO_PRIVATE_KEY
```

## 🚨 **Troubleshooting:**

### **Common Issues:**

#### **1. "contract was not deployed"**
- **Cause:** Dry run mode or network issues
- **Solution:** Use the fixed scripts with `cast send`

#### **2. "ABI encoding error"**
- **Cause:** Wrong constructor argument format
- **Solution:** Scripts now use proper ABI encoding

#### **3. "insufficient funds"**
- **Cause:** Account doesn't have enough 0G tokens
- **Solution:** Get testnet tokens from 0G faucet

#### **4. "permission denied"**
- **Cause:** Vault doesn't have mint role
- **Solution:** Scripts automatically set permissions

### **Debugging Steps:**
1. **Check environment variables:**
   ```bash
   source .env
   echo "RPC: $GALILEO_RPC_URL"
   echo "Key: ${GALILEO_PRIVATE_KEY:0:10}..."
   ```

2. **Check network connectivity:**
   ```bash
   curl -X POST $GALILEO_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

3. **Check account balance:**
   ```bash
   cast balance $(cast wallet address --private-key $GALILEO_PRIVATE_KEY) --rpc-url $GALILEO_RPC_URL
   ```

## 📁 **Output Files:**

### **deployment-working.json / deployment-to0g.json:**
```json
{
  "network": "0G Galileo Testnet",
  "deploymentTime": "2025-01-30T12:30:00Z",
  "status": "SUCCESS",
  "contracts": {
    "rebaseToken": { "address": "0x..." },
    "pool": { "address": "0x..." },
    "vault": { "address": "0x..." }
  },
  "configuration": { ... },
  "permissions": { ... },
  "testResults": { ... }
}
```

## 🎯 **Next Steps After Deployment:**

1. **Update Frontend:**
   ```bash
   # Edit frontend/src/config/contracts.ts
   # Replace addresses with new ones
   ```

2. **Test Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Connect Wallet:**
   - Switch to 0G Galileo Testnet
   - Connect MetaMask
   - Test deposit functionality

4. **Submit to Hackathon:**
   - Working demo with deployed contracts
   - Functional frontend
   - Complete documentation

---

## ✅ **Success Indicators:**

- ✅ All contracts deployed successfully
- ✅ Contract addresses extracted correctly
- ✅ Permissions set automatically
- ✅ Test deposit works
- ✅ JSON file created with all info
- ✅ Frontend ready for testing

**The deployment scripts are now reliable and ready for future use!** 🚀 