#!/bin/bash

# Load environment variables
source .env

echo "🚀 Deploying Rebase Token Vault to 0G Galileo Testnet (Simple Method)..."

# Compile contracts
echo "📦 Compiling contracts..."
forge build

# Deploy RebaseToken
echo "📦 Deploying RebaseToken..."
REBASE_TOKEN_OUTPUT=$(forge create src/RebaseToken.sol:RebaseToken \
    --rpc-url ${GALILEO_RPC_URL} \
    --private-key ${GALILEO_PRIVATE_KEY} \
    --constructor-args "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4" \
    --broadcast)

echo "RebaseToken output: $REBASE_TOKEN_OUTPUT"

# Extract address
REBASE_TOKEN_ADDRESS=$(echo "$REBASE_TOKEN_OUTPUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$REBASE_TOKEN_ADDRESS" ]; then
    echo "❌ Failed to deploy RebaseToken"
    exit 1
fi

echo "✅ RebaseToken deployed at: $REBASE_TOKEN_ADDRESS"

# Deploy Pool
echo "📦 Deploying Pool..."
POOL_OUTPUT=$(forge create src/RebaseTokenPool.sol:RebaseTokenPool \
    --rpc-url ${GALILEO_RPC_URL} \
    --private-key ${GALILEO_PRIVATE_KEY} \
    --constructor-args "$REBASE_TOKEN_ADDRESS" "[]" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4" \
    --broadcast)

echo "Pool output: $POOL_OUTPUT"

# Extract address
POOL_ADDRESS=$(echo "$POOL_OUTPUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$POOL_ADDRESS" ]; then
    echo "❌ Failed to deploy Pool"
    exit 1
fi

echo "✅ Pool deployed at: $POOL_ADDRESS"

# Deploy Vault
echo "📦 Deploying Vault..."
VAULT_OUTPUT=$(forge create src/Vault.sol:Vault \
    --rpc-url ${GALILEO_RPC_URL} \
    --private-key ${GALILEO_PRIVATE_KEY} \
    --constructor-args "$REBASE_TOKEN_ADDRESS" \
    --broadcast)

echo "Vault output: $VAULT_OUTPUT"

# Extract address
VAULT_ADDRESS=$(echo "$VAULT_OUTPUT" | grep "Deployed to:" | awk '{print $3}')

if [ -z "$VAULT_ADDRESS" ]; then
    echo "❌ Failed to deploy Vault"
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
cat > deployment-simple.json << EOF
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

echo "🎉 Simple deployment complete!"
echo "Contract Addresses:"
echo "  Rebase Token: $REBASE_TOKEN_ADDRESS"
echo "  Pool: $POOL_ADDRESS"
echo "  Vault: $VAULT_ADDRESS"
echo ""
echo "📄 Deployment info saved to deployment-simple.json"
echo ""
echo "Next steps:"
echo "1. Update frontend/src/config/contracts.ts with these addresses"
echo "2. Run the frontend: cd frontend && npm run dev"
echo "3. Test the vault functionality on 0G Galileo Testnet" 