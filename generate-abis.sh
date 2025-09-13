#!/bin/bash

# Generate ABIs from compiled contracts and update frontend

set -e

echo "🔨 Generating ABIs from compiled contracts..."
echo "============================================="

# Check if contracts are compiled
if [ ! -d "./out" ]; then
    echo "❌ Error: Contracts not compiled. Running forge build..."
    forge build
fi

# Create frontend contracts directory if it doesn't exist
mkdir -p frontend/src/contracts

echo "📄 Extracting ABIs..."

# Extract RebaseToken ABI
if [ -f "./out/RebaseToken.sol/RebaseToken.json" ]; then
    jq '.abi' ./out/RebaseToken.sol/RebaseToken.json > frontend/src/contracts/RebaseToken.json
    echo "✅ RebaseToken ABI extracted"
else
    echo "❌ Error: RebaseToken.sol not found in out directory"
fi

# Extract Vault ABI
if [ -f "./out/Vault.sol/Vault.json" ]; then
    jq '.abi' ./out/Vault.sol/Vault.json > frontend/src/contracts/Vault.json
    echo "✅ Vault ABI extracted"
else
    echo "❌ Error: Vault.sol not found in out directory"
fi

# Extract SimpleRebaseTokenPool ABI
if [ -f "./out/SimpleRebaseTokenPool.sol/SimpleRebaseTokenPool.json" ]; then
    jq '.abi' ./out/SimpleRebaseTokenPool.sol/SimpleRebaseTokenPool.json > frontend/src/contracts/SimpleRebaseTokenPool.json
    echo "✅ SimpleRebaseTokenPool ABI extracted"
else
    echo "❌ Error: SimpleRebaseTokenPool.sol not found in out directory"
fi

echo ""
echo "📁 ABI files generated in frontend/src/contracts/:"
ls -la frontend/src/contracts/

echo ""
echo "✅ ABI generation completed!"
echo ""
echo "🔄 Next steps:"
echo "1. Update your frontend components to use the new ABIs"
echo "2. Test the frontend integration with deployed contracts"
