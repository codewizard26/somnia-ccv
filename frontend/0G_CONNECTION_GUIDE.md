# 🔧 **0G Network Connection Troubleshooting Guide**

## 🚨 **Common Issues & Solutions:**

### **1. Frontend Not Connecting to 0G**

#### **Problem:** Frontend shows wrong network or can't connect
#### **Solutions:**

1. **Check RPC URL:**
   - ✅ **Correct:** `https://evmrpc-testnet.0g.ai`
   - ❌ **Wrong:** `https://galileo.0g.ai`

2. **Verify Chain ID:**
   - ✅ **Correct:** `2131427466778448014`
   - ❌ **Wrong:** Any other number

3. **Check MetaMask Network:**
   - Open MetaMask → Settings → Networks
   - Make sure 0G Galileo Testnet is added with correct details

### **2. MetaMask Network Configuration**

#### **Add 0G Galileo Testnet to MetaMask:**

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
   Chain ID: 2131427466778448014
   Currency Symbol: 0G
   Block Explorer URL: https://galileo.0g.ai
   ```

4. **Save and Switch:**
   - Click "Save"
   - Switch to the 0G network

### **3. MetaMask Display Issues**

#### **Problem:** MetaMask shows "ETH" instead of "0G"
#### **Solution:** This is normal! MetaMask has a display issue with 0G tokens.

**What's happening:**
- ✅ You're actually sending 0G tokens
- ✅ The transaction will work correctly
- ❌ MetaMask just shows "ETH" in the UI

**How to verify:**
1. Check the transaction on the block explorer
2. Look at your 0G balance before and after
3. The debug component shows the correct balance

### **4. Network Detection Issues**

#### **Problem:** Frontend doesn't detect correct network
#### **Solutions:**

1. **Refresh the page** after switching networks
2. **Disconnect and reconnect** your wallet
3. **Check the debug component** for network info
4. **Verify RPC URL** in the configuration

### **5. Balance Display Issues**

#### **Problem:** Balance shows 0 or doesn't load
#### **Solutions:**

1. **Check if you have 0G tokens:**
   - Get testnet tokens from 0G faucet
   - Check your balance on the block explorer

2. **Verify network connection:**
   - Make sure you're on the correct network
   - Check the debug component

3. **Refresh the page:**
   - Sometimes balances take time to load
   - Try refreshing after connecting

## 🔍 **Debug Steps:**

### **Step 1: Check Debug Component**
The debug component shows:
- ✅ Wallet connection status
- ✅ Current chain ID
- ✅ Expected chain ID
- ✅ Network match status
- ✅ Balance information

### **Step 2: Verify Network Configuration**
```javascript
// Check these values match:
Chain ID: 2131427466778448014
RPC URL: https://evmrpc-testnet.0g.ai
Currency: 0G
```

### **Step 3: Test Network Connection**
```bash
# Test RPC endpoint
curl -X POST https://evmrpc-testnet.0g.ai \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

### **Step 4: Check MetaMask**
1. Open MetaMask
2. Check current network
3. Verify network details
4. Try switching networks

## 🎯 **Quick Fixes:**

### **If Frontend Shows Wrong Network:**
1. Switch to 0G network in MetaMask
2. Refresh the page
3. Check debug component

### **If Can't Connect:**
1. Disconnect wallet
2. Refresh page
3. Reconnect wallet
4. Switch to 0G network

### **If Balance is 0:**
1. Get testnet tokens from faucet
2. Wait for balance to load
3. Check block explorer

### **If MetaMask Shows ETH:**
1. This is normal - ignore it
2. You're actually sending 0G
3. Check transaction on explorer

## 📱 **Frontend Features:**

### **Debug Component:**
- Shows real-time network status
- Displays wallet connection info
- Shows balance and address
- Helps troubleshoot issues

### **Network Detection:**
- Automatically detects wrong network
- Shows clear error messages
- Provides network switching guidance

### **MetaMask Warnings:**
- Explains display issues
- Provides network setup instructions
- Shows correct configuration

## ✅ **Success Indicators:**

- ✅ Debug component shows "Connected to 0G Galileo Testnet"
- ✅ Balance displays correctly
- ✅ Network detection works
- ✅ Can see wallet address
- ✅ No error messages

## 🚀 **Next Steps After Connection:**

1. **Test Deposit:** Try depositing a small amount
2. **Check Balances:** Verify RBT tokens are received
3. **Test Withdrawal:** Try withdrawing after some time
4. **Monitor Interest:** Watch RBT balance increase

---

**Remember:** The 0G network is a testnet, so expect some network issues and retry if needed. The debug component will help you identify and fix any connection problems. 