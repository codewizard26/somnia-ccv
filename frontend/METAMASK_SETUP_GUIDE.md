# 🔧 **MetaMask 0G Galileo Testnet Setup Guide**

## 🚨 **IMPORTANT: Chain ID Correction**

The correct chain ID for 0G Galileo Testnet is **16601** (not 2131427466778448014).

## 📋 **Correct Network Configuration:**

```
Network Name: 0G Galileo Testnet
RPC URL: https://evmrpc-testnet.0g.ai
Chain ID: 16601
Currency Symbol: 0G
Block Explorer URL: https://galileo.0g.ai
```

## 🔧 **Step-by-Step MetaMask Setup:**

### **Step 1: Remove Old Network (if exists)**
1. Open MetaMask
2. Click the network dropdown (top of MetaMask)
3. If you see "0G Galileo Testnet", click the settings icon (⚙️)
4. Click "Remove Network"
5. Confirm removal

### **Step 2: Add New Network**
1. **Open MetaMask Settings:**
   - Click the MetaMask extension
   - Click the menu (3 dots) → Settings

2. **Go to Networks:**
   - Click "Networks" in the left sidebar
   - Click "Add Network"

3. **Enter Network Details:**
   ```
   Network Name: 0G Galileo Testnet
   RPC URL: https://evmrpc-testnet.0g.ai
   Chain ID: 16601
   Currency Symbol: 0G
   Block Explorer URL: https://galileo.0g.ai
   ```

4. **Save and Switch:**
   - Click "Save"
   - Switch to the 0G network

### **Step 3: Verify Connection**
1. **Check Network Dropdown:**
   - Should show "0G Galileo Testnet"
   - Chain ID should show 16601

2. **Test Connection:**
   - Try sending a small transaction
   - Check if balance loads correctly

## 🔍 **Troubleshooting Steps:**

### **If Network Won't Add:**
1. **Clear Browser Cache:**
   - Clear MetaMask cache
   - Refresh the page

2. **Check RPC URL:**
   - Make sure it's exactly: `https://evmrpc-testnet.0g.ai`
   - No extra spaces or characters

3. **Check Chain ID:**
   - Must be exactly: `16601`
   - Not 2131427466778448014

### **If Can't Switch Networks:**
1. **Disconnect Wallet:**
   - Disconnect from the frontend
   - Refresh the page

2. **Reconnect:**
   - Connect wallet again
   - Switch to 0G network in MetaMask

3. **Check Debug Component:**
   - Look at the debug info on the frontend
   - Verify chain ID matches

### **If Balance Shows 0:**
1. **Get Testnet Tokens:**
   - Visit 0G faucet
   - Request testnet tokens

2. **Wait for Balance:**
   - Sometimes takes a few minutes
   - Check block explorer

## 🎯 **Quick Fix Commands:**

### **Test RPC Connection:**
```bash
curl -X POST https://evmrpc-testnet.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
```

### **Expected Response:**
```json
{"jsonrpc":"2.0","id":1,"result":"0x40d9"}
```

## 📱 **Frontend Debug Info:**

The debug component on the frontend will show:
- ✅ **Wallet Connected:** Yes/No
- ✅ **Current Chain ID:** Should be 16601
- ✅ **Expected Chain ID:** 16601
- ✅ **Correct Network:** Yes/No
- ✅ **Balance:** Your 0G balance

## 🚨 **Common Issues:**

### **Issue 1: Wrong Chain ID**
- **Problem:** Using old chain ID (2131427466778448014)
- **Solution:** Use correct chain ID (16601)

### **Issue 2: RPC URL Wrong**
- **Problem:** Using wrong RPC URL
- **Solution:** Use `https://evmrpc-testnet.0g.ai`

### **Issue 3: Network Not Switching**
- **Problem:** MetaMask stuck on wrong network
- **Solution:** Remove and re-add network

### **Issue 4: Balance Not Loading**
- **Problem:** No 0G tokens in wallet
- **Solution:** Get tokens from faucet

## ✅ **Success Indicators:**

- ✅ MetaMask shows "0G Galileo Testnet"
- ✅ Chain ID shows 16601
- ✅ Balance displays correctly
- ✅ Debug component shows "Connected to 0G Galileo Testnet"
- ✅ Can see wallet address
- ✅ No error messages

## 🔄 **After Setup:**

1. **Test Connection:**
   - Connect wallet to frontend
   - Check debug component
   - Verify network detection

2. **Test Deposit:**
   - Try depositing small amount
   - Check if transaction goes through

3. **Monitor Balances:**
   - Check 0G balance
   - Check RBT balance after deposit

---

## 🎯 **Summary:**

**Correct Configuration:**
- **Chain ID:** 16601 (0x40d9)
- **RPC URL:** https://evmrpc-testnet.0g.ai
- **Currency:** 0G
- **Explorer:** https://galileo.0g.ai

**Key Steps:**
1. Remove old network
2. Add new network with correct details
3. Switch to 0G network
4. Test connection
5. Get testnet tokens if needed

**The frontend should now properly connect to 0G Galileo Testnet!** 🚀 