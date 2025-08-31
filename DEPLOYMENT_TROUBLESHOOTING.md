# 🔧 Deployment Troubleshooting Guide

## 🚨 **Common Deployment Issues:**

### **1. Empty Contract Addresses**
**Problem:** Deployment script shows empty addresses
```
✅ RebaseToken deployed at: 
✅ Pool deployed at: 
✅ Vault deployed at: 
```

**Solutions:**
1. **Use the simple deployment script:**
   ```bash
   ./deploy-simple.sh
   ```

2. **Check environment variables:**
   ```bash
   source .env
   echo "RPC URL: $GALILEO_RPC_URL"
   echo "Private Key: ${GALILEO_PRIVATE_KEY:0:10}..."
   ```

3. **Verify network connectivity:**
   ```bash
   curl -X POST $GALILEO_RPC_URL \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

### **2. ABI Encoding Errors**
**Problem:** 
```
Error: Could not ABI encode the function and arguments. Did you pass in the right types?
expected hex digits or the `0x` prefix for an empty hex string
```

**Solutions:**
1. **Use `forge create` instead of `cast send`:**
   ```bash
   forge create src/RebaseToken.sol:RebaseToken \
     --rpc-url $GALILEO_RPC_URL \
     --private-key $GALILEO_PRIVATE_KEY \
     --constructor-args "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4" \
     --broadcast
   ```

2. **Check constructor arguments:**
   - RebaseToken: `(string, string, address, address, address)`
   - Pool: `(address, address[], address, address)`
   - Vault: `(address)`

### **3. Gas Estimation Errors**
**Problem:**
```
Error: Failed to estimate gas: server returned an error response: error code 3: execution reverted
```

**Solutions:**
1. **Check account balance:**
   ```bash
   cast balance $(cast wallet address --private-key $GALILEO_PRIVATE_KEY) --rpc-url $GALILEO_RPC_URL
   ```

2. **Increase gas limit:**
   ```bash
   forge create ... --gas-limit 5000000
   ```

3. **Check contract compilation:**
   ```bash
   forge build --force
   ```

### **4. Permission Errors**
**Problem:**
```
error: invalid value '' for '[TO]': invalid string length
```

**Solutions:**
1. **Verify contract addresses are extracted correctly**
2. **Check if addresses are valid:**
   ```bash
   cast wallet address --private-key $GALILEO_PRIVATE_KEY
   ```

## 🛠️ **Step-by-Step Debugging:**

### **Step 1: Verify Environment**
```bash
# Check .env file
cat .env

# Source environment
source .env

# Verify variables
echo "RPC: $GALILEO_RPC_URL"
echo "Key: ${GALILEO_PRIVATE_KEY:0:10}..."
```

### **Step 2: Test Network Connection**
```bash
# Test RPC endpoint
curl -X POST $GALILEO_RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check account balance
cast balance $(cast wallet address --private-key $GALILEO_PRIVATE_KEY) --rpc-url $GALILEO_RPC_URL
```

### **Step 3: Compile Contracts**
```bash
# Force recompile
forge build --force

# Check for compilation errors
forge build --sizes
```

### **Step 4: Deploy Step by Step**
```bash
# Deploy RebaseToken only
forge create src/RebaseToken.sol:RebaseToken \
  --rpc-url $GALILEO_RPC_URL \
  --private-key $GALILEO_PRIVATE_KEY \
  --constructor-args "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4" \
  --broadcast
```

## 🚀 **Alternative Deployment Methods:**

### **Method 1: Manual Deployment**
```bash
# Deploy each contract manually
forge create src/RebaseToken.sol:RebaseToken --rpc-url $GALILEO_RPC_URL --private-key $GALILEO_PRIVATE_KEY --constructor-args "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4" --broadcast

# Copy the address and use it for Pool deployment
forge create src/RebaseTokenPool.sol:RebaseTokenPool --rpc-url $GALILEO_RPC_URL --private-key $GALILEO_PRIVATE_KEY --constructor-args "REBASE_TOKEN_ADDRESS" "[]" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4" --broadcast

# Deploy Vault
forge create src/Vault.sol:Vault --rpc-url $GALILEO_RPC_URL --private-key $GALILEO_PRIVATE_KEY --constructor-args "REBASE_TOKEN_ADDRESS" --broadcast
```

### **Method 2: Use Foundry Scripts**
```bash
# Create a deployment script
forge script script/Deploy.s.sol:DeployScript --rpc-url $GALILEO_RPC_URL --private-key $GALILEO_PRIVATE_KEY --broadcast
```

## 🔍 **Common Issues and Solutions:**

### **Issue: "contract was not deployed"**
**Cause:** Network issues, insufficient gas, or compilation errors
**Solution:** Check network connectivity and account balance

### **Issue: "ABI encoding error"**
**Cause:** Wrong constructor argument types or format
**Solution:** Use `forge create` with proper argument formatting

### **Issue: "execution reverted"**
**Cause:** Contract logic error or insufficient funds
**Solution:** Check contract logic and account balance

### **Issue: "invalid address"**
**Cause:** Malformed address or wrong network
**Solution:** Verify addresses and network configuration

## 📞 **Getting Help:**

If you're still having issues:

1. **Check the logs:** Look for specific error messages
2. **Verify network:** Ensure you're connected to 0G Galileo Testnet
3. **Check balance:** Make sure your account has enough 0G tokens
4. **Try manual deployment:** Deploy contracts one by one
5. **Use the simple script:** `./deploy-simple.sh`

**Remember:** The 0G network is a testnet, so expect some network issues and retry if needed. 