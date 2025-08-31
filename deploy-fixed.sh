#!/bin/bash

# Load environment variables
source .env

echo "🚀 Deploying Fixed Rebase Token Vault to 0G Galileo Testnet..."

# Compile contracts
echo "📦 Compiling contracts..."
forge build

# Get bytecode
REBASE_TOKEN_BYTECODE=$(forge inspect RebaseToken bytecode)
POOL_BYTECODE=$(forge inspect RebaseTokenPool bytecode)
VAULT_BYTECODE=$(forge inspect Vault bytecode)

# Deploy RebaseToken
echo "📦 Deploying RebaseToken..."
REBASE_TOKEN_ARGS=$(cast abi-encode "constructor(string,string,address,address,address)" "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")
echo "RebaseToken args: $REBASE_TOKEN_ARGS"

DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${REBASE_TOKEN_BYTECODE}${REBASE_TOKEN_ARGS:2}" 2>&1)
echo "Deploy output: $DEPLOY_OUTPUT"

# Extract address from output
REBASE_TOKEN_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "contractAddress: 0x[a-fA-F0-9]\{40\}" | cut -d' ' -f2)

if [ -z "$REBASE_TOKEN_ADDRESS" ]; then
    echo "❌ Failed to extract RebaseToken address from output"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ RebaseToken deployed at: $REBASE_TOKEN_ADDRESS"

# Deploy Pool
echo "📦 Deploying Pool..."
# Fix the empty array encoding - use 0x for empty array
POOL_ARGS=$(cast abi-encode "constructor(address,address[],address,address)" "$REBASE_TOKEN_ADDRESS" "0x" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")
echo "Pool args: $POOL_ARGS"

DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${POOL_BYTECODE}${POOL_ARGS:2}" 2>&1)
echo "Deploy output: $DEPLOY_OUTPUT"

# Extract address from output
POOL_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "contractAddress: 0x[a-fA-F0-9]\{40\}" | cut -d' ' -f2)

if [ -z "$POOL_ADDRESS" ]; then
    echo "❌ Failed to extract Pool address from output"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Pool deployed at: $POOL_ADDRESS"

# Deploy Vault
echo "📦 Deploying Vault..."
VAULT_ARGS=$(cast abi-encode "constructor(address)" "$REBASE_TOKEN_ADDRESS")
echo "Vault args: $VAULT_ARGS"

DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${VAULT_BYTECODE}${VAULT_ARGS:2}" 2>&1)
echo "Deploy output: $DEPLOY_OUTPUT"

# Extract address from output
VAULT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -o "contractAddress: 0x[a-fA-F0-9]\{40\}" | cut -d' ' -f2)

if [ -z "$VAULT_ADDRESS" ]; then
    echo "❌ Failed to extract Vault address from output"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

echo "✅ Vault deployed at: $VAULT_ADDRESS"

# Set permissions
echo "🔐 Setting permissions..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$REBASE_TOKEN_ADDRESS" "grantMintAndBurnRole(address)" "$POOL_ADDRESS"
echo "✅ Pool permissions granted"

# Test initial deposit
echo "💰 Testing initial deposit..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$VAULT_ADDRESS" --value 1000000000000000000000000000
echo "✅ Initial deposit successful"

# Create deployment info
cat > deployment-fixed.json << EOF
{
  "network": "0G Galileo Testnet",
  "deploymentTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "rebaseToken": {
      "address": "$REBASE_TOKEN_ADDRESS",
      "name": "Rebase Token",
      "symbol": "RBT"
    },
    "pool": {
      "address": "$POOL_ADDRESS",
      "description": "Rebase Token Pool"
    },
    "vault": {
      "address": "$VAULT_ADDRESS",
      "description": "Fixed Interest-bearing vault"
    }
  },
  "configuration": {
    "router": "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4",
    "rnmProxy": "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059",
    "linkToken": "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49",
    "initialDeposit": "1000000000000000000000000000"
  },
  "frontend": {
    "updateFile": "frontend/src/config/contracts.ts",
    "instructions": "Update CONTRACTS object with these addresses"
  }
}
EOF

echo "🎉 Fixed deployment complete!"
echo "Contract Addresses:"
echo "  Rebase Token: $REBASE_TOKEN_ADDRESS"
echo "  Pool: $POOL_ADDRESS"
echo "  Vault: $VAULT_ADDRESS"
echo ""
echo "📄 Deployment info saved to deployment-fixed.json"
echo ""
echo "Next steps:"
echo "1. Update frontend/src/config/contracts.ts with these addresses"
echo "2. Run the frontend: cd frontend && npm run dev"
echo "3. Test the vault functionality on 0G Galileo Testnet"
echo ""
echo "🔧 Fixed Issues:"
echo "• Vault now properly accepts 0G tokens"
echo "• Frontend defaults to 0G network"
echo "• Network detection and switching added"
echo "• MetaMask display issue warnings added" 