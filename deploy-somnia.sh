#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./deploy-somnia.sh [--verify] [--legacy] [--gas-limit <num>] [--gas-price <wei>] \
#                      [--priority-gas-price <wei>] [--gas-estimate-multiplier <num>]
#
# Requirements:
# - .env file with PRIVATE_KEY and SOMNIA_RPC_URL
# - foundry (forge, cast) installed
# - jq installed

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Tooling checks
command -v forge >/dev/null 2>&1 || { echo "[ERROR] forge not found. Install Foundry." >&2; exit 1; }
command -v cast  >/dev/null 2>&1 || { echo "[ERROR] cast not found. Install Foundry." >&2; exit 1; }
command -v jq    >/dev/null 2>&1 || { echo "[ERROR] jq not found. Install jq." >&2; exit 1; }

if [[ -f .env ]]; then
    # shellcheck disable=SC1091
    set -a; source .env; set +a
fi

VERIFY=false
LEGACY=false
GAS_LIMIT=6000000
GAS_PRICE=""
PRIORITY_GAS_PRICE=""
GAS_ESTIMATE_MULTIPLIER=""
for arg in "$@"; do
  case "$arg" in
    --verify)
      VERIFY=true
      shift
      ;;
    --legacy)
      LEGACY=true
      shift
      ;;
    --gas-limit)
      shift
      GAS_LIMIT="${1:-}"
      if [[ -z "$GAS_LIMIT" ]]; then echo "[ERROR] --gas-limit requires a value" >&2; exit 1; fi
      shift || true
      ;;
    --gas-price)
      shift
      GAS_PRICE="${1:-}"
      if [[ -z "$GAS_PRICE" ]]; then echo "[ERROR] --gas-price requires a value (in wei)" >&2; exit 1; fi
      shift || true
      ;;
    --priority-gas-price)
      shift
      PRIORITY_GAS_PRICE="${1:-}"
      if [[ -z "$PRIORITY_GAS_PRICE" ]]; then echo "[ERROR] --priority-gas-price requires a value (in wei)" >&2; exit 1; fi
      shift || true
      ;;
    --gas-estimate-multiplier)
      shift
      GAS_ESTIMATE_MULTIPLIER="${1:-}"
      if [[ -z "$GAS_ESTIMATE_MULTIPLIER" ]]; then echo "[ERROR] --gas-estimate-multiplier requires a value" >&2; exit 1; fi
      shift || true
      ;;
    *) ;;
  esac
done

if [[ -z "${SOMNIA_RPC_URL:-}" ]]; then
  echo "[ERROR] SOMNIA_RPC_URL not set. Set it in .env or env vars." >&2
  exit 1
fi

if [[ -z "${PRIVATE_KEY:-}" ]]; then
  echo "[ERROR] PRIVATE_KEY not set. Set it in .env or env vars." >&2
  exit 1
fi

echo "==> Starting deployment to Somnia ($SOMNIA_RPC_URL)"

FORGE_ARGS=(
  script script/DeploySomniaContracts.s.sol:DeploySomniaContracts
  --rpc-url "$SOMNIA_RPC_URL"
  --broadcast
  --block-gas-limit "$GAS_LIMIT"
  -vvvv
)

if [[ -n "$GAS_ESTIMATE_MULTIPLIER" ]]; then
  FORGE_ARGS+=( --gas-estimate-multiplier "$GAS_ESTIMATE_MULTIPLIER" )
fi

if [[ "$VERIFY" == true ]]; then
  FORGE_ARGS+=( --verify --verifier blockscout --verifier-url https://somnia-testnet.socialscan.io/api )
fi

if [[ "$LEGACY" == true ]]; then
  FORGE_ARGS+=( --legacy )
  # If legacy and user didn't provide a gas price, set it to baseFee + 2 gwei
  if [[ -z "$GAS_PRICE" ]]; then
    BASE_FEE_HEX=$(cast rpc eth_getBlockByNumber latest false --rpc-url "$SOMNIA_RPC_URL" | jq -r .result.baseFeePerGas)
    if [[ "$BASE_FEE_HEX" == "null" || -z "$BASE_FEE_HEX" ]]; then
      echo "[WARNING] Could not fetch baseFeePerGas; defaulting legacy gasPrice to 5 gwei"
      GAS_PRICE=5000000000
    else
      BASE_FEE_DEC=$(cast to-dec "$BASE_FEE_HEX")
      GAS_PRICE=$((BASE_FEE_DEC + 2000000000))
    fi
  fi
  FORGE_ARGS+=( --gas-price "$GAS_PRICE" )
else
  # EIP-1559 path; set priority gas price if provided
  if [[ -n "$PRIORITY_GAS_PRICE" ]]; then
    FORGE_ARGS+=( --priority-gas-price "$PRIORITY_GAS_PRICE" )
  fi
fi

set +e
forge "${FORGE_ARGS[@]}"
SCRIPT_EXIT=$?
set -e

if [[ $SCRIPT_EXIT -ne 0 ]]; then
  echo "[WARN] forge script failed (exit $SCRIPT_EXIT). Falling back to direct contract creation."

  # Resolve deployer address
  DEPLOYER_ADDR=$(cast wallet address --private-key "$PRIVATE_KEY")
  echo "Deployer: $DEPLOYER_ADDR"

  # Build common gas args for create/send
  GAS_ARGS=()
  if [[ "$LEGACY" == true ]]; then
    GAS_ARGS+=( --legacy )
    if [[ -z "$GAS_PRICE" ]]; then
      BASE_FEE_HEX=$(cast rpc eth_getBlockByNumber latest false --rpc-url "$SOMNIA_RPC_URL" | jq -r .result.baseFeePerGas)
      if [[ "$BASE_FEE_HEX" == "null" || -z "$BASE_FEE_HEX" ]]; then
        GAS_PRICE=6000000000
      else
        BASE_FEE_DEC=$(cast to-dec "$BASE_FEE_HEX")
        GAS_PRICE=$((BASE_FEE_DEC + 2000000000))
      fi
    fi
    GAS_ARGS+=( --gas-price "$GAS_PRICE" )
  else
    if [[ -n "$PRIORITY_GAS_PRICE" ]]; then
      GAS_ARGS+=( --priority-gas-price "$PRIORITY_GAS_PRICE" )
    fi
  fi

  echo "==> Creating RebaseToken"
  RT_OUT=$(forge create src/RebaseToken.sol:RebaseToken \
    --rpc-url "$SOMNIA_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --json \
    --gas-limit "$GAS_LIMIT" \
    "${GAS_ARGS[@]}" 2>&1)
  echo "$RT_OUT" | tail -n +1
  REBASER=$(echo "$RT_OUT" | jq -r '.deployedTo // empty' | tail -1)
  if [[ -z "$REBASER" ]]; then echo "[ERROR] Failed to parse RebaseToken address" >&2; exit 1; fi
  echo "RebaseToken: $REBASER"

  echo "==> Creating Vault"
  VAULT_OUT=$(forge create src/Vault.sol:Vault \
    --constructor-args "$REBASER" "$DEPLOYER_ADDR" \
    --rpc-url "$SOMNIA_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --json \
    --gas-limit "$GAS_LIMIT" \
    "${GAS_ARGS[@]}" 2>&1)
  echo "$VAULT_OUT" | tail -n +1
  VAULT=$(echo "$VAULT_OUT" | jq -r '.deployedTo // empty' | tail -1)
  if [[ -z "$VAULT" ]]; then echo "[ERROR] Failed to parse Vault address" >&2; exit 1; fi
  echo "Vault: $VAULT"

  echo "==> Creating SimpleRebaseTokenPool"
  POOL_OUT=$(forge create src/SimpleRebaseTokenPool.sol:SimpleRebaseTokenPool \
    --constructor-args "$VAULT" "$REBASER" "$DEPLOYER_ADDR" \
    --rpc-url "$SOMNIA_RPC_URL" \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --json \
    --gas-limit "$GAS_LIMIT" \
    "${GAS_ARGS[@]}" 2>&1)
  echo "$POOL_OUT" | tail -n +1
  POOL=$(echo "$POOL_OUT" | jq -r '.deployedTo // empty' | tail -1)
  if [[ -z "$POOL" ]]; then echo "[ERROR] Failed to parse Pool address" >&2; exit 1; fi
  echo "Pool: $POOL"

  echo "==> Granting roles and wiring"
  cast send "$REBASER" "grantMintAndBurnRole(address)" "$VAULT" \
    --rpc-url "$SOMNIA_RPC_URL" --private-key "$PRIVATE_KEY" --gas-limit "$GAS_LIMIT" "${GAS_ARGS[@]}"
  cast send "$REBASER" "grantMintAndBurnRole(address)" "$POOL" \
    --rpc-url "$SOMNIA_RPC_URL" --private-key "$PRIVATE_KEY" --gas-limit "$GAS_LIMIT" "${GAS_ARGS[@]}"
  cast send "$VAULT" "setPool(address)" "$POOL" \
    --rpc-url "$SOMNIA_RPC_URL" --private-key "$PRIVATE_KEY" --gas-limit "$GAS_LIMIT" "${GAS_ARGS[@]}"

  # Build deployment-info.json manually
  CHAIN_ID=$(cast chain-id --rpc-url "$SOMNIA_RPC_URL")
  TIMESTAMP=$(date +%s)
  BLOCK_NUM=$(cast block-number --rpc-url "$SOMNIA_RPC_URL")
  cat > deployment-info.json <<JSON
{
  "chainId": $CHAIN_ID,
  "rebaseToken": "$REBASER",
  "vault": "$VAULT",
  "pool": "$POOL",
  "deployer": "$DEPLOYER_ADDR",
  "timestamp": $TIMESTAMP,
  "blockNumber": $BLOCK_NUM
}
JSON

  # Frontend deployments file
  mkdir -p frontend/src/contracts
  cat > frontend/src/contracts/deployments.json <<JSON
{
  "$CHAIN_ID": {
    "rebaseToken": "$REBASER",
    "vault": "$VAULT",
    "pool": "$POOL",
    "timestamp": $TIMESTAMP
  }
}
JSON
fi

if [[ ! -f deployment-info.json ]]; then
  echo "[ERROR] deployment-info.json not found. Deployment may have failed." >&2
  exit 1
fi

REBASER=$(jq -r .rebaseToken deployment-info.json)
VAULT=$(jq -r .vault deployment-info.json)
POOL=$(jq -r .pool deployment-info.json)
CHAIN_ID=$(jq -r .chainId deployment-info.json)

echo "==> Deployed addresses"
echo "ChainId:   $CHAIN_ID"
echo "RebaseToken: $REBASER"
echo "Vault:       $VAULT"
echo "Pool:        $POOL"

ROLE=0x$(cast keccak "MINT_AND_BURN_ROLE" | cut -c3-66)

echo "==> Checking roles on RebaseToken"
HAS_VAULT=$(cast call "$REBASER" "hasRole(bytes32,address)(bool)" "$ROLE" "$VAULT" --rpc-url "$SOMNIA_RPC_URL")
HAS_POOL=$(cast call "$REBASER" "hasRole(bytes32,address)(bool)" "$ROLE" "$POOL" --rpc-url "$SOMNIA_RPC_URL")

echo "Vault has MINT_AND_BURN_ROLE: $HAS_VAULT"
echo "Pool  has MINT_AND_BURN_ROLE: $HAS_POOL"

if [[ "$HAS_VAULT" != "true" || "$HAS_POOL" != "true" ]]; then
  echo "[WARNING] Expected roles not set on RebaseToken. Check deployment logs or owner status." >&2
fi

echo "==> Verifying vault wiring"
VAULT_POOL=$(cast call "$VAULT" "pool()(address)" --rpc-url "$SOMNIA_RPC_URL")
echo "Vault.pool(): $VAULT_POOL"
if [[ "$VAULT_POOL" != "$POOL" ]]; then
  echo "[WARNING] Vault.pool() != Pool address. Expected $POOL, got $VAULT_POOL" >&2
fi

FRONTEND_DEPLOY_JSON="frontend/src/contracts/deployments.json"
if [[ -f "$FRONTEND_DEPLOY_JSON" ]]; then
  echo "==> Frontend deployments file exists: $FRONTEND_DEPLOY_JSON"
  echo "$(cat "$FRONTEND_DEPLOY_JSON")" | jq . > /dev/null 2>&1 || echo "[WARNING] deployments.json is not valid JSON"
else
  echo "[INFO] Frontend deployments file not found (expected $FRONTEND_DEPLOY_JSON). Script should have created it."
fi

echo "==> Generating ABIs for frontend"
if [[ -x ./generate-abis.sh ]]; then
  ./generate-abis.sh
else
  bash ./generate-abis.sh
fi

FRONTEND_CONFIG="frontend/src/config/contracts.ts"
if [[ -f "$FRONTEND_CONFIG" ]]; then
  echo "==> Updating frontend config addresses in $FRONTEND_CONFIG"
  # BSD sed in-place edit
  sed -E -i '' "s/(REBASE_TOKEN: \")0x[0-9a-fA-F]{40}/\\1$REBASER/" "$FRONTEND_CONFIG"
  sed -E -i '' "s/(POOL: \")0x[0-9a-fA-F]{40}/\\1$POOL/" "$FRONTEND_CONFIG"
  sed -E -i '' "s/(VAULT: \")0x[0-9a-fA-F]{40}/\\1$VAULT/" "$FRONTEND_CONFIG"
  echo "Updated addresses in $FRONTEND_CONFIG"
else
  echo "[INFO] $FRONTEND_CONFIG not found; skipping address update."
fi

echo "==> Done."


