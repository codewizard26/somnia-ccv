#!/bin/bash

# Define constants 
AMOUNT=1000000000 # 1 million tokens with 18 decimals

# Script to bridge tokens from 0G Galileo Testnet to Sepolia using native 0G as fee
# This script deploys and configures the necessary contracts for cross-chain token bridging
# Vault is deployed on Galileo (source chain)

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

if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "ERROR: SEPOLIA_RPC_URL environment variable is not set"
    echo "Please set SEPOLIA_RPC_URL in your .env file"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "ERROR: PRIVATE_KEY environment variable is not set"
    echo "Please set PRIVATE_KEY in your .env file"
    exit 1
fi

echo "Environment variables check passed!"
echo "Galileo RPC URL: ${GALILEO_RPC_URL:0:20}..."
echo "Sepolia RPC URL: ${SEPOLIA_RPC_URL:0:20}..."

# Galileo and Sepolia configuration constants

GALILEO_REGISTRY_MODULE_OWNER_CUSTOM="0xf1C53C1f9d0e5872a454Da43E6dbC93d019325e1"
GALILEO_TOKEN_ADMIN_REGISTRY="0xE75f53017a840d761b44aaa83AAf5cdEb0760733"
GALILEO_ROUTER="0x5c21Bb4Bd151Bd6Fa2E6d7d1b63B83485529Cdb4"
GALILEO_RNM_PROXY_ADDRESS="0x83eBE7Ceb4916C3Cb86662f65b353E4324390059"
GALILEO_CHAIN_SELECTOR="2131427466778448014"
GALILEO_NATIVE_TOKEN_ADDRESS="0x1Cd0690fF9a693f5EF2dD976660a8dAFc81A109c"
GALILEO_LINK_ADDRESS="0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49"

SEPOLIA_REGISTRY_MODULE_OWNER_CUSTOM="0x62e731218d0D47305aba2BE3751E7EE9E5520790"
SEPOLIA_TOKEN_ADMIN_REGISTRY="0x95F29FEE11c5C55d26cCcf1DB6772DE953B37B82"
SEPOLIA_ROUTER="0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59"
SEPOLIA_RNM_PROXY_ADDRESS="0xba3f6251de62dED61Ff98590cB2fDf6871FbB991"
SEPOLIA_CHAIN_SELECTOR="16015286601757825753"
SEPOLIA_LINK_ADDRESS="0x779877A7B0D9E8603169DdbD7836e478b4624789"

# Compile and deploy the Rebase Token contract on Galileo
# First ensure foundry is installed and up to date
curl -L https://foundry.paradigm.xyz | bash
source ~/.zshrc
foundryup
forge build
echo "Compiling and deploying the Rebase Token contract on Galileo..."
GALILEO_REBASE_TOKEN_ADDRESS=$(forge create src/RebaseToken.sol:RebaseToken --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY}  --broadcast --constructor-args "Rebase Token" "RBT" ${GALILEO_RNM_PROXY_ADDRESS} ${GALILEO_LINK_ADDRESS} ${GALILEO_ROUTER} | awk '/Deployed to:/ {print $3}')
echo "Galileo rebase token address: $GALILEO_REBASE_TOKEN_ADDRESS"

# Check if deployment was successful
if [ -z "$GALILEO_REBASE_TOKEN_ADDRESS" ] || [ "$GALILEO_REBASE_TOKEN_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy RebaseToken contract on Galileo"
    echo "Please check your Galileo RPC URL and private key"
    exit 1
fi

# Validate the address format
if [[ ! "$GALILEO_REBASE_TOKEN_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Galileo rebase token address: $GALILEO_REBASE_TOKEN_ADDRESS"
    exit 1
fi

# Compile and deploy the pool contract on Galileo
echo "Compiling and deploying the pool contract on Galileo..."
GALILEO_POOL_ADDRESS=$(forge create src/RebaseTokenPool.sol:RebaseTokenPool --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --broadcast --constructor-args ${GALILEO_REBASE_TOKEN_ADDRESS} [] ${GALILEO_RNM_PROXY_ADDRESS} ${GALILEO_ROUTER} | awk '/Deployed to:/ {print $3}')
echo "Galileo pool address: $GALILEO_POOL_ADDRESS"

# Check if deployment was successful
if [ -z "$GALILEO_POOL_ADDRESS" ] || [ "$GALILEO_POOL_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy RebaseTokenPool contract on Galileo"
    echo "Please check your Galileo RPC URL and private key"
    exit 1
fi

# Validate the address format
if [[ ! "$GALILEO_POOL_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Galileo pool address: $GALILEO_POOL_ADDRESS"
    exit 1
fi

# Deploy the vault on Galileo (source chain)
echo "Deploying the vault on Galileo..."
VAULT_ADDRESS=$(forge script ./script/Deployer.s.sol:VaultDeployer --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --broadcast --sig "run(address)" ${GALILEO_REBASE_TOKEN_ADDRESS} | grep 'vault: contract Vault' | awk '{print $NF}')
echo "Galileo vault address: $VAULT_ADDRESS"

# Test the Galileo pool configuration before configuring
echo "Testing Galileo pool configuration..."
forge script ./script/TestPoolConfig.s.sol:TestPoolConfig --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --sig "run(address)" ${GALILEO_POOL_ADDRESS}

# Set the permissions for the pool contract on Galileo
echo "Setting the permissions for the pool contract on Galileo..."
cast send ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "grantMintAndBurnRole(address)" ${GALILEO_POOL_ADDRESS}
echo "Pool permissions set on Galileo"

# Set the CCIP roles and permissions on Galileo
echo "Setting the CCIP roles and permissions on Galileo..."
cast send ${GALILEO_REGISTRY_MODULE_OWNER_CUSTOM} "registerAdminViaOwner(address)" ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY}
cast send ${GALILEO_TOKEN_ADMIN_REGISTRY} "acceptAdminRole(address)" ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY}
cast send ${GALILEO_TOKEN_ADMIN_REGISTRY} "setPool(address,address)" ${GALILEO_REBASE_TOKEN_ADDRESS} ${GALILEO_POOL_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY}
echo "CCIP roles and permissions set on Galileo"

# Deploy contracts on Sepolia
echo "Running the script to deploy the contracts on Sepolia..."
output=$(forge script ./script/Deployer.s.sol:TokenAndPoolDeployer --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast)
echo "Contracts deployed and permission set on Sepolia"

# Extract the addresses from the output
SEPOLIA_REBASE_TOKEN_ADDRESS=$(echo "$output" | grep 'token: contract RebaseToken' | awk '{print $4}')
SEPOLIA_POOL_ADDRESS=$(echo "$output" | grep 'pool: contract RebaseTokenPool' | awk '{print $4}')

echo "Sepolia rebase token address: $SEPOLIA_REBASE_TOKEN_ADDRESS"
echo "Sepolia pool address: $SEPOLIA_POOL_ADDRESS"

# Check if Sepolia deployment was successful
if [ -z "$SEPOLIA_REBASE_TOKEN_ADDRESS" ] || [ "$SEPOLIA_REBASE_TOKEN_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy RebaseToken contract on Sepolia"
    echo "Please check your Sepolia RPC URL and private key"
    exit 1
fi

if [ -z "$SEPOLIA_POOL_ADDRESS" ] || [ "$SEPOLIA_POOL_ADDRESS" = "" ]; then
    echo "ERROR: Failed to deploy RebaseTokenPool contract on Sepolia"
    echo "Please check your Sepolia RPC URL and private key"
    exit 1
fi

# Validate the address formats
if [[ ! "$SEPOLIA_REBASE_TOKEN_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Sepolia rebase token address: $SEPOLIA_REBASE_TOKEN_ADDRESS"
    exit 1
fi

if [[ ! "$SEPOLIA_POOL_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    echo "ERROR: Invalid Sepolia pool address: $SEPOLIA_POOL_ADDRESS"
    exit 1
fi

# Test the Sepolia pool configuration before configuring
echo "Testing Sepolia pool configuration..."
forge script ./script/TestPoolConfig.s.sol:TestPoolConfig --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --sig "run(address)" ${SEPOLIA_POOL_ADDRESS}

# Configure the pool on Sepolia
echo "Configuring the pool on Sepolia..."

# Check pool ownership
echo "Checking Sepolia pool ownership..."
SEPOLIA_POOL_OWNER=$(cast call ${SEPOLIA_POOL_ADDRESS} --rpc-url ${SEPOLIA_RPC_URL} "owner()")
SENDER_ADDRESS=$(cast wallet address --private-key ${PRIVATE_KEY})
echo "Sepolia pool owner: $SEPOLIA_POOL_OWNER"
echo "Sender address: $SENDER_ADDRESS"

# Extract the last 20 bytes (40 characters) from the pool owner address to remove padding
SEPOLIA_POOL_OWNER_CLEAN="0x${SEPOLIA_POOL_OWNER: -40}"
echo "Sepolia pool owner (cleaned): $SEPOLIA_POOL_OWNER_CLEAN"

# Convert addresses to lowercase for comparison
SEPOLIA_POOL_OWNER_LOWER=$(echo "$SEPOLIA_POOL_OWNER_CLEAN" | tr '[:upper:]' '[:lower:]')
SENDER_ADDRESS_LOWER=$(echo "$SENDER_ADDRESS" | tr '[:upper:]' '[:lower:]')

if [ "$SEPOLIA_POOL_OWNER_LOWER" != "$SENDER_ADDRESS_LOWER" ]; then
    echo "ERROR: Sender is not the owner of the Sepolia pool. Cannot configure."
    echo "Pool owner (lowercase): $SEPOLIA_POOL_OWNER_LOWER"
    echo "Sender address (lowercase): $SENDER_ADDRESS_LOWER"
    exit 1
fi

# Configure Sepolia pool to support Galileo
forge script ./script/ConfigurePool.s.sol:ConfigurePoolScript --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --broadcast --sig "run(address,uint64,address,address,bool,uint128,uint128,bool,uint128,uint128)" ${SEPOLIA_POOL_ADDRESS} ${GALILEO_CHAIN_SELECTOR} ${GALILEO_POOL_ADDRESS} ${GALILEO_REBASE_TOKEN_ADDRESS} false 0 0 false 0 0

# Check what chains are currently supported by the Sepolia pool
echo "Checking currently supported chains in Sepolia pool..."
SEPOLIA_SUPPORTED_CHAINS=$(cast call ${SEPOLIA_POOL_ADDRESS} --rpc-url ${SEPOLIA_RPC_URL} "getSupportedChains()")
echo "Sepolia pool supported chains: $SEPOLIA_SUPPORTED_CHAINS"

# Verify the pool configuration on Sepolia
echo "Verifying pool configuration on Sepolia..."
SEPOLIA_CHAIN_SUPPORTED=$(cast call ${SEPOLIA_POOL_ADDRESS} --rpc-url ${SEPOLIA_RPC_URL} "isSupportedChain(uint64)" ${GALILEO_CHAIN_SELECTOR})
echo "Sepolia pool supports Galileo chain: $SEPOLIA_CHAIN_SUPPORTED"

# Check if the chain is supported (boolean true = 0x0000000000000000000000000000000000000000000000000000000000000001)
if [ "$SEPOLIA_CHAIN_SUPPORTED" != "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "ERROR: Sepolia pool does not support Galileo chain. Configuration may have failed."
    echo "Attempting to manually configure the pool..."
    
    # Try to manually configure the pool using cast
    echo "Manually adding Galileo chain to Sepolia pool..."
    cast send ${SEPOLIA_POOL_ADDRESS} --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} "applyChainUpdates((uint64,bytes,bytes,bool,uint128,uint128,bool,uint128,uint128)[])" "[(${GALILEO_CHAIN_SELECTOR},0x000000000000000000000000${GALILEO_POOL_ADDRESS:2},0x000000000000000000000000${GALILEO_REBASE_TOKEN_ADDRESS:2},false,0,0,false,0,0)]"
    
    # Check again
    SEPOLIA_CHAIN_SUPPORTED=$(cast call ${SEPOLIA_POOL_ADDRESS} --rpc-url ${SEPOLIA_RPC_URL} "isSupportedChain(uint64)" ${GALILEO_CHAIN_SELECTOR})
    echo "Sepolia pool supports Galileo chain after manual config: $SEPOLIA_CHAIN_SUPPORTED"
    
    if [ "$SEPOLIA_CHAIN_SUPPORTED" != "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
        echo "ERROR: Manual configuration also failed. Exiting."
        exit 1
    fi
fi

# Test the Sepolia pool configuration after configuring
echo "Testing Sepolia pool configuration after setup..."
forge script ./script/TestPoolConfig.s.sol:TestPoolConfig --rpc-url ${SEPOLIA_RPC_URL} --private-key ${PRIVATE_KEY} --sig "run(address)" ${SEPOLIA_POOL_ADDRESS}

# Configure the pool on Galileo
echo "Configuring the pool on Galileo..."

# Check pool ownership
echo "Checking Galileo pool ownership..."
GALILEO_POOL_OWNER=$(cast call ${GALILEO_POOL_ADDRESS} --rpc-url ${GALILEO_RPC_URL} "owner()")
GALILEO_SENDER_ADDRESS=$(cast wallet address --private-key ${GALILEO_PRIVATE_KEY})
echo "Galileo pool owner: $GALILEO_POOL_OWNER"
echo "Galileo sender address: $GALILEO_SENDER_ADDRESS"

# Extract the last 20 bytes (40 characters) from the pool owner address to remove padding
GALILEO_POOL_OWNER_CLEAN="0x${GALILEO_POOL_OWNER: -40}"
echo "Galileo pool owner (cleaned): $GALILEO_POOL_OWNER_CLEAN"

# Convert addresses to lowercase for comparison
GALILEO_POOL_OWNER_LOWER=$(echo "$GALILEO_POOL_OWNER_CLEAN" | tr '[:upper:]' '[:lower:]')
GALILEO_SENDER_ADDRESS_LOWER=$(echo "$GALILEO_SENDER_ADDRESS" | tr '[:upper:]' '[:lower:]')

if [ "$GALILEO_POOL_OWNER_LOWER" != "$GALILEO_SENDER_ADDRESS_LOWER" ]; then
    echo "ERROR: Sender is not the owner of the Galileo pool. Cannot configure."
    echo "Pool owner (lowercase): $GALILEO_POOL_OWNER_LOWER"
    echo "Sender address (lowercase): $GALILEO_SENDER_ADDRESS_LOWER"
    exit 1
fi

# Configure Galileo pool to support Sepolia
forge script ./script/ConfigurePool.s.sol:ConfigurePoolScript --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --broadcast --sig "run(address,uint64,address,address,bool,uint128,uint128,bool,uint128,uint128)" ${GALILEO_POOL_ADDRESS} ${SEPOLIA_CHAIN_SELECTOR} ${SEPOLIA_POOL_ADDRESS} ${SEPOLIA_REBASE_TOKEN_ADDRESS} false 0 0 false 0 0

# Check what chains are currently supported by the Galileo pool
echo "Checking currently supported chains in Galileo pool..."
GALILEO_SUPPORTED_CHAINS=$(cast call ${GALILEO_POOL_ADDRESS} --rpc-url ${GALILEO_RPC_URL} "getSupportedChains()")
echo "Galileo pool supported chains: $GALILEO_SUPPORTED_CHAINS"

# Verify the pool configuration on Galileo
echo "Verifying pool configuration on Galileo..."
GALILEO_CHAIN_SUPPORTED=$(cast call ${GALILEO_POOL_ADDRESS} --rpc-url ${GALILEO_RPC_URL} "isSupportedChain(uint64)" ${SEPOLIA_CHAIN_SELECTOR})
echo "Galileo pool supports Sepolia chain: $GALILEO_CHAIN_SUPPORTED"

# Check if the chain is supported (boolean true = 0x0000000000000000000000000000000000000000000000000000000000000001)
if [ "$GALILEO_CHAIN_SUPPORTED" != "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
    echo "ERROR: Galileo pool does not support Sepolia chain. Configuration may have failed."
    echo "Attempting to manually configure the pool..."
    
    # Try to manually configure the pool using cast
    echo "Manually adding Sepolia chain to Galileo pool..."
    cast send ${GALILEO_POOL_ADDRESS} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "applyChainUpdates((uint64,bytes,bytes,bool,uint128,uint128,bool,uint128,uint128)[])" "[(${SEPOLIA_CHAIN_SELECTOR},0x000000000000000000000000${SEPOLIA_POOL_ADDRESS:2},0x000000000000000000000000${SEPOLIA_REBASE_TOKEN_ADDRESS:2},false,0,0,false,0,0)]"
    
    # Check again
    GALILEO_CHAIN_SUPPORTED=$(cast call ${GALILEO_POOL_ADDRESS} --rpc-url ${GALILEO_RPC_URL} "isSupportedChain(uint64)" ${SEPOLIA_CHAIN_SELECTOR})
    echo "Galileo pool supports Sepolia chain after manual config: $GALILEO_CHAIN_SUPPORTED"
    
    if [ "$GALILEO_CHAIN_SUPPORTED" != "0x0000000000000000000000000000000000000000000000000000000000000001" ]; then
        echo "ERROR: Manual configuration also failed. Exiting."
        exit 1
    fi
fi

# Test the Galileo pool configuration after configuring
echo "Testing Galileo pool configuration after setup..."
forge script ./script/TestPoolConfig.s.sol:TestPoolConfig --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --sig "run(address)" ${GALILEO_POOL_ADDRESS}

# Deposit funds to the vault on Galileo
echo "Depositing funds to the vault on Galileo..."
cast send ${VAULT_ADDRESS} --value ${AMOUNT} --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} "deposit()"

# Wait a beat for some interest to accrue
sleep 2

# Check LINK token balance for fees
echo "Checking LINK token balance for fees..."
GALILEO_SENDER_ADDRESS=$(cast wallet address --private-key ${GALILEO_PRIVATE_KEY})
LINK_BALANCE=$(cast balance ${GALILEO_SENDER_ADDRESS} --erc20 ${GALILEO_LINK_ADDRESS} --rpc-url ${GALILEO_RPC_URL})
echo "LINK token balance: $LINK_BALANCE"

# Note: The script will use your maximum LINK balance as fee to ensure the transaction goes through.
echo "Note: The script will use your maximum LINK balance as fee to ensure the transaction goes through."

# Bridge the funds from Galileo to Sepolia using LINK tokens as fee
echo "Bridging the funds from Galileo to Sepolia using LINK tokens as fee..."
GALILEO_BALANCE_BEFORE=$(cast balance ${GALILEO_SENDER_ADDRESS} --erc20 ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL})
echo "Galileo balance before bridging: $GALILEO_BALANCE_BEFORE"

# Use the regular bridge script instead
forge script ./script/BridgeTokens.s.sol:BridgeTokensScript --rpc-url ${GALILEO_RPC_URL} --private-key ${GALILEO_PRIVATE_KEY} --broadcast --sig "run(address,uint64,address,uint256,address,address)" ${GALILEO_SENDER_ADDRESS} ${SEPOLIA_CHAIN_SELECTOR} ${GALILEO_REBASE_TOKEN_ADDRESS} ${AMOUNT} ${GALILEO_LINK_ADDRESS} ${GALILEO_ROUTER}

echo "Funds bridged from Galileo to Sepolia using LINK tokens as fee"
GALILEO_BALANCE_AFTER=$(cast balance ${GALILEO_SENDER_ADDRESS} --erc20 ${GALILEO_REBASE_TOKEN_ADDRESS} --rpc-url ${GALILEO_RPC_URL})
echo "Galileo balance after bridging: $GALILEO_BALANCE_AFTER"

echo "✅ Bridge setup complete! Vault is deployed on Galileo and tokens can be bridged to Sepolia using LINK tokens as fee." 