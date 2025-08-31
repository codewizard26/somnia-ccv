#!/bin/bash

# Complete deployment script for 0G
source .env

echo "🚀 Deploying Rebase Token Vault to 0G Galileo Testnet..."

# Get contract bytecodes
REBASE_TOKEN_BYTECODE=$(forge inspect RebaseToken bytecode)
POOL_BYTECODE=$(forge inspect RebaseTokenPool bytecode)
VAULT_BYTECODE=$(forge inspect Vault bytecode)

# Constructor arguments
REBASE_TOKEN_ARGS=$(cast abi-encode "constructor(string,string,address,address,address)" "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")

echo "📦 Deploying RebaseToken..."
DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${REBASE_TOKEN_BYTECODE}${REBASE_TOKEN_ARGS:2}")
REBASE_TOKEN_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')
echo "✅ RebaseToken deployed at: $REBASE_TOKEN_ADDRESS"

# Deploy Pool
echo "📦 Deploying Pool..."
POOL_ARGS=$(cast abi-encode "constructor(address,address[],address,address)" "$REBASE_TOKEN_ADDRESS" "[]" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")
DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${POOL_BYTECODE}${POOL_ARGS:2}")
POOL_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')
echo "✅ Pool deployed at: $POOL_ADDRESS"

# Deploy Vault
echo "📦 Deploying Vault..."
VAULT_ARGS=$(cast abi-encode "constructor(address)" "$REBASE_TOKEN_ADDRESS")
DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${VAULT_BYTECODE}${VAULT_ARGS:2}")
VAULT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')
echo "✅ Vault deployed at: $VAULT_ADDRESS"

# Set permissions
echo "🔐 Setting permissions..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$REBASE_TOKEN_ADDRESS" "grantMintAndBurnRole(address)" "$POOL_ADDRESS"
echo "✅ Pool permissions granted"

# Deposit initial funds (1 billion tokens)
echo "💰 Depositing initial funds to vault..."
cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "$VAULT_ADDRESS" --value 1000000000000000000000000000
echo "✅ Initial funds deposited"

# Create deployment info
echo "📄 Creating deployment info..."
cat > deployment-info.json << EOF
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
      "description": "Interest-bearing vault"
    }
  },
  "configuration": {
    "router": "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4",
    "rnmProxy": "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059",
    "linkToken": "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49",
    "initialDeposit": "1000000000000000000000000000"
  }
}
EOF

echo "🎉 Deployment complete!"
echo ""
echo "Contract Addresses:"
echo "  Rebase Token: $REBASE_TOKEN_ADDRESS"
echo "  Pool: $POOL_ADDRESS"
echo "  Vault: $VAULT_ADDRESS"
echo ""
echo "📄 Deployment info saved to deployment-info.json"
echo ""
echo "Next steps:"
echo "  1. Update frontend/src/config/contracts.ts with these addresses"
echo "  2. Run the frontend: cd frontend && npm run dev"
echo "  3. Test the vault functionality" 