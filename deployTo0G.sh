#!/bin/bash

# Load environment variables first
if [ -f ".env" ]; then
    source .env
    echo "✅ .env file loaded successfully"
else
    echo "❌ .env file not found"
    echo "Please create a .env file with the required environment variables"
    exit 1
fi

# Check required environment variables
echo "Checking environment variables..."

if [ -z "$GALILEO_RPC_URL" ]; then
    echo "ERROR: GALILEO_RPC_URL environment variable is not set"
    echo "Please set GALILEO_RPC_URL in your .env file"
    exit 1
fi

if [ -z "$GALILEO_PRIVATE_KEY" ]; then
    echo "ERROR: GALILEO_PRIVATE_KEY environment variable is not set"
    echo "Please set GALILEO_PRIVATE_KEY in your .env file"
    exit 1
fi

echo "Environment variables check passed!"
echo "Galileo RPC URL: ${GALILEO_RPC_URL:0:20}..."

# Compile contracts
echo "Compiling contracts..."
forge build

# Deploy the Rebase Token contract on Galileo using cast send
echo "Deploying the Rebase Token contract on Galileo..."
REBASE_TOKEN_BYTECODE=$(forge inspect RebaseToken bytecode)
REBASE_TOKEN_ARGS=$(cast abi-encode "constructor(string,string,address,address,address)" "Rebase Token" "RBT" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")

DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${REBASE_TOKEN_BYTECODE}${REBASE_TOKEN_ARGS:2}" 2>&1)
GALILEO_REBASE_TOKEN_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')

echo "Galileo rebase token address: $GALILEO_REBASE_TOKEN_ADDRESS"

# Check if deployment was successful
if [ -z "$GALILEO_REBASE_TOKEN_ADDRESS" ] || [ "$GALILEO_REBASE_TOKEN_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy RebaseToken contract on Galileo"
    echo "Please check your Galileo RPC URL and private key"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

# Validate the address format
if [[ ! "$GALILEO_REBASE_TOKEN_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Galileo rebase token address: $GALILEO_REBASE_TOKEN_ADDRESS"
    exit 1
fi

# Compile and deploy the pool contract on Galileo
echo "Compiling and deploying the pool contract on Galileo..."
POOL_BYTECODE=$(forge inspect RebaseTokenPool bytecode)
POOL_ARGS=$(cast abi-encode "constructor(address,address[],address,address)" "$GALILEO_REBASE_TOKEN_ADDRESS" "[]" "0x83eBE7Ceb4916C3Cb86662f65b353E4324390059" "0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4")

DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${POOL_BYTECODE}${POOL_ARGS:2}" 2>&1)
GALILEO_POOL_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')

echo "Galileo pool address: $GALILEO_POOL_ADDRESS"

# Check if deployment was successful
if [ -z "$GALILEO_POOL_ADDRESS" ] || [ "$GALILEO_POOL_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy RebaseTokenPool contract on Galileo"
    echo "Please check your Galileo RPC URL and private key"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

# Validate the address format
if [[ ! "$GALILEO_POOL_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Galileo pool address: $GALILEO_POOL_ADDRESS"
    exit 1
fi

# Deploy the vault on Galileo
echo "Deploying the vault on Galileo..."
VAULT_BYTECODE=$(forge inspect Vault bytecode)
VAULT_ARGS=$(cast abi-encode "constructor(address)" "$GALILEO_REBASE_TOKEN_ADDRESS")

DEPLOY_OUTPUT=$(cast send --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --create "${VAULT_BYTECODE}${VAULT_ARGS:2}" 2>&1)
VAULT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep "contractAddress" | awk '{print $2}')

echo "Galileo vault address: $VAULT_ADDRESS"

# Check if deployment was successful
if [ -z "$VAULT_ADDRESS" ] || [ "$VAULT_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy Vault contract on Galileo"
    echo "Please check your Galileo RPC URL and private key"
    echo "Full output: $DEPLOY_OUTPUT"
    exit 1
fi

# Validate the address format
if [[ ! "$VAULT_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Galileo vault address: $VAULT_ADDRESS"
    exit 1
fi

# Set the permissions for the pool contract on Galileo
echo "Setting the permissions for the pool contract on Galileo..."
cast send ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "grantMintAndBurnRole(address)" ${GALILEO_POOL_ADDRESS}
echo "Pool permissions set on Galileo"

# Set the permissions for the vault contract on Galileo
echo "Setting the permissions for the vault contract on Galileo..."
cast send ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "grantMintAndBurnRole(address)" ${VAULT_ADDRESS}
echo "Vault permissions set on Galileo"

# Test initial deposit
echo "Testing initial deposit..."
cast send ${VAULT_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --value 100000000000000000 "deposit()"
echo "Initial deposit successful"

# Create deployment info
cat > deployment-to0g.json << EOF
{
  "network": "0G Galileo Testnet",
  "deploymentTime": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "SUCCESS",
  "contracts": {
    "rebaseToken": {
      "address": "$GALILEO_REBASE_TOKEN_ADDRESS",
      "name": "Rebase Token",
      "symbol": "RBT"
    },
    "pool": {
      "address": "$GALILEO_POOL_ADDRESS",
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
    "testDeposit": "100000000000000000"
  },
  "permissions": {
    "poolHasMintRole": true,
    "vaultHasMintRole": true
  },
  "frontend": {
    "updateFile": "frontend/src/config/contracts.ts",
    "instructions": "Update CONTRACTS object with these addresses"
  }
}
EOF

echo "✅ Deployment complete! Vault is deployed on Galileo and ready for use."
echo "Contract Addresses:"
echo "  Rebase Token: $GALILEO_REBASE_TOKEN_ADDRESS"
echo "  Pool: $GALILEO_POOL_ADDRESS"
echo "  Vault: $VAULT_ADDRESS"
echo ""
echo "📄 Deployment info saved to deployment-to0g.json"
echo ""
echo "Next steps:"
echo "1. Update frontend/src/config/contracts.ts with these addresses"
echo "2. Run the frontend: cd frontend && npm run dev"
echo "3. Test the vault functionality on 0G Galileo Testnet" 