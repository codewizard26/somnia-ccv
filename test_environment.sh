#!/bin/bash

echo "=== Environment Variable Test ==="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "ERROR: .env file not found"
    echo "Please create a .env file with the following variables:"
    echo "GALILEO_RPC_URL=your_galileo_rpc_url"
    echo "GALILEO_PRIVATE_KEY=your_galileo_private_key"
    echo "SEPOLIA_RPC_URL=your_sepolia_rpc_url"
    echo "PRIVATE_KEY=your_sepolia_private_key"
    exit 1
fi

# Load environment variables
source .env

echo "Checking environment variables..."

# Check Galileo variables
if [ -z "$GALILEO_RPC_URL" ]; then
    echo "❌ GALILEO_RPC_URL is not set"
else
    echo "✅ GALILEO_RPC_URL is set: ${GALILEO_RPC_URL:0:30}..."
fi

if [ -z "$GALILEO_PRIVATE_KEY" ]; then
    echo "❌ GALILEO_PRIVATE_KEY is not set"
else
    echo "✅ GALILEO_PRIVATE_KEY is set: ${GALILEO_PRIVATE_KEY:0:10}..."
fi

# Check Sepolia variables
if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ SEPOLIA_RPC_URL is not set"
else
    echo "✅ SEPOLIA_RPC_URL is set: ${SEPOLIA_RPC_URL:0:30}..."
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY is not set"
else
    echo "✅ PRIVATE_KEY is set: ${PRIVATE_KEY:0:10}..."
fi

echo ""
echo "=== RPC Connection Test ==="

# Test Galileo RPC connection
if [ ! -z "$GALILEO_RPC_URL" ]; then
    echo "Testing Galileo RPC connection..."
    GALILEO_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' "$GALILEO_RPC_URL" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$GALILEO_BLOCK" ]; then
        echo "✅ Galileo RPC connection successful. Block number: $GALILEO_BLOCK"
    else
        echo "❌ Galileo RPC connection failed"
    fi
fi

# Test Sepolia RPC connection
if [ ! -z "$SEPOLIA_RPC_URL" ]; then
    echo "Testing Sepolia RPC connection..."
    SEPOLIA_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' "$SEPOLIA_RPC_URL" | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$SEPOLIA_BLOCK" ]; then
        echo "✅ Sepolia RPC connection successful. Block number: $SEPOLIA_BLOCK"
    else
        echo "❌ Sepolia RPC connection failed"
    fi
fi

echo ""
echo "=== Wallet Address Test ==="

# Test wallet address derivation
if [ ! -z "$GALILEO_PRIVATE_KEY" ]; then
    echo "Testing Galileo wallet address derivation..."
    GALILEO_ADDRESS=$(cast wallet address --private-key "$GALILEO_PRIVATE_KEY" 2>/dev/null)
    if [ ! -z "$GALILEO_ADDRESS" ]; then
        echo "✅ Galileo wallet address: $GALILEO_ADDRESS"
    else
        echo "❌ Failed to derive Galileo wallet address"
    fi
fi

if [ ! -z "$PRIVATE_KEY" ]; then
    echo "Testing Sepolia wallet address derivation..."
    SEPOLIA_ADDRESS=$(cast wallet address --private-key "$PRIVATE_KEY" 2>/dev/null)
    if [ ! -z "$SEPOLIA_ADDRESS" ]; then
        echo "✅ Sepolia wallet address: $SEPOLIA_ADDRESS"
    else
        echo "❌ Failed to derive Sepolia wallet address"
    fi
fi

echo ""
echo "=== Test Complete ===" 