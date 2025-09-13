#!/bin/bash

# Test deployment script - validates that contracts can be deployed successfully
# This is a dry run that doesn't actually deploy to avoid spending gas

set -e

echo "🧪 Testing contract deployment (dry run)..."
echo "==========================================="

# Check if private key is set (we'll use a dummy key for testing)
export PRIVATE_KEY="0x0000000000000000000000000000000000000000000000000000000000000001"

# Somnia Testnet configuration
SOMNIA_RPC_URL="https://dream-rpc.somnia.network"
CHAIN_ID=50312

echo "📡 RPC URL: $SOMNIA_RPC_URL"
echo "🔗 Chain ID: $CHAIN_ID"
echo ""

# Test compilation first
echo "🔨 Testing contract compilation..."
forge build

if [ $? -eq 0 ]; then
    echo "✅ Contracts compile successfully!"
else
    echo "❌ Contract compilation failed!"
    exit 1
fi

# Test deployment script syntax (dry run)
echo ""
echo "🧪 Testing deployment script syntax..."
forge script script/DeploySomniaContracts.s.sol:DeploySomniaContracts \
    --rpc-url $SOMNIA_RPC_URL \
    --via-ir \
    -vvvv

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment script syntax is valid!"
    echo ""
    echo "🎯 Ready for actual deployment!"
    echo "Run './deploy-somnia.sh' with your real private key to deploy."
else
    echo ""
    echo "❌ Deployment script has issues!"
    echo "Please fix the errors above before deploying."
    exit 1
fi

# Test ABI generation
echo ""
echo "🔄 Testing ABI generation..."
./generate-abis.sh

if [ $? -eq 0 ]; then
    echo "✅ ABI generation works!"
else
    echo "❌ ABI generation failed!"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Ready for deployment."
echo ""
echo "Next steps:"
echo "1. Set your real private key: export PRIVATE_KEY=your_key_here"
echo "2. Run: ./deploy-somnia.sh"
echo "3. Test the frontend integration"
