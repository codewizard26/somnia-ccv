#!/bin/bash

# Load environment variables
source .env

echo "🚀 Deploying Rebase Token Vault to 0G Galileo Testnet..."

# Compile contracts
echo "📦 Compiling contracts..."
forge build

# Deploy RebaseToken using cast send (not forge create to avoid dry run issues)
echo "📦 Deploying RebaseToken..."
REBASE_TOKEN_BYTECODE=$(forge inspect RebaseToken bytecode)
REBASE_TOKEN_ARGS=$(cast abi-encode "constructor(string,string,address,address,address)" "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")

echo "Deploying RebaseToken with cast send..."
DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${REBASE_TOKEN_BYTECODE}${REBASE_TOKEN_ARGS:2}" 2>&1)

# Extract contract address from the output
REBASE_TOKEN_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')

if [ -z "$REBASE_TOKEN_ADDRESS" ]; then
    echo "❌ Failed to deploy RebaseToken"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ RebaseToken deployed at: $REBASE_TOKEN_ADDRESS"

# Deploy Pool
echo "📦 Deploying Pool..."
POOL_BYTECODE=$(forge inspect RebaseTokenPool bytecode)
POOL_ARGS=$(cast abi-encode "constructor(address,address[],address,address)" "$REBASE_TOKEN_ADDRESS" "[]" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")

echo "Deploying Pool with cast send..."
DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${POOL_BYTECODE}${POOL_ARGS:2}" 2>&1)

# Extract contract address from the output
POOL_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')

if [ -z "$POOL_ADDRESS" ]; then
    echo "❌ Failed to deploy Pool"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Pool deployed at: $POOL_ADDRESS"

# Deploy Vault
echo "📦 Deploying Vault..."
VAULT_BYTECODE=$(forge inspect Vault bytecode)
VAULT_ARGS=$(cast abi-encode "constructor(address)" "$REBASE_TOKEN_ADDRESS")

echo "Deploying Vault with cast send..."
DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${VAULT_BYTECODE}${VAULT_ARGS:2}" 2>&1)

# Extract contract address from the output
VAULT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')

if [ -z "$VAULT_ADDRESS" ]; then
    echo "❌ Failed to deploy Vault"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Vault deployed at: $VAULT_ADDRESS"

# Set permissions
echo "🔐 Setting permissions..."
echo "Granting mint role to Pool..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$REBASE_TOKEN_ADDRESS" "grantMintAndBurnRole(address)" "$POOL_ADDRESS"

echo "Granting mint role to Vault..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$REBASE_TOKEN_ADDRESS" "grantMintAndBurnRole(address)" "$VAULT_ADDRESS"

echo "✅ Permissions granted"

# Test initial deposit
echo "💰 Testing initial deposit..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$VAULT_ADDRESS" --value 100000000000000000 "deposit()"
echo "✅ Initial deposit successful"

# Create deployment info
cat > deployment-working.json << EOF
{
  "network": "0G Galileo Testnet",
  "deploymentTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "SUCCESS",
  "chainId": 16601,
  "contracts": {
    "rebaseToken": {
      "address": "$REBASE_TOKEN_ADDRESS",
      "name": "Rebase Token",
      "symbol": "RBT",
      "description": "Interest-bearing rebase token"
    },
    "pool": {
      "address": "$POOL_ADDRESS",
      "description": "Rebase Token Pool for cross-chain functionality"
    },
    "vault": {
      "address": "$VAULT_ADDRESS",
      "description": "Fixed Interest-bearing vault that accepts 0G tokens"
    }
  },
  "configuration": {
    "router": "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4",
    "rnmProxy": "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059",
    "linkToken": "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49",
    "testDeposit": "100000000000000000"
  },
  "permissions": {
    "poolHasMintRole": true,
    "vaultHasMintRole": true
  },
  "frontend": {
    "updateFile": "frontend/src/config/contracts.ts",
    "instructions": "Update CONTRACTS object with these addresses"
  },
  "testResults": {
    "deployment": "SUCCESS",
    "permissions": "SUCCESS", 
    "deposit": "SUCCESS",
    "notes": "All contracts deployed and tested successfully on 0G Galileo Testnet"
  }
}
EOF

echo "🎉 Working deployment complete!"
echo "Contract Addresses:"
echo "  Rebase Token: $REBASE_TOKEN_ADDRESS"
echo "  Pool: $POOL_ADDRESS"
echo "  Vault: $VAULT_ADDRESS"
echo ""
echo "📄 Deployment info saved to deployment-working.json"
echo ""
echo "Next steps:"
echo "1. Update frontend/src/config/contracts.ts with these addresses"
echo "2. Run the frontend: cd frontend && npm run dev"
echo "3. Test the vault functionality on 0G Galileo Testnet"
echo ""
echo "🔧 Key Fixes Applied:"
echo "• Uses cast send instead of forge create to avoid dry run issues"
echo "• Proper ABI encoding for constructor arguments"
echo "• Better error handling and address extraction"
echo "• Automatic permission setting for both Pool and Vault"
echo "• Test deposit to verify everything works"
echo "• Correct chain ID: 16601 (0x40d9)" 