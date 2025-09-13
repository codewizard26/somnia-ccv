// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RebaseToken} from "../src/RebaseToken.sol";
import {Vault} from "../src/Vault.sol";
import {SimpleRebaseTokenPool} from "../src/SimpleRebaseTokenPool.sol";
import {IRebaseToken} from "../src/interfaces/IRebaseToken.sol";

/**
 * @title DeploySomniaContracts
 * @author Your Name
 * @notice Deployment script for deploying all contracts to Somnia Testnet
 * @dev This script deploys RebaseToken, Vault, and SimpleRebaseTokenPool contracts
 */
contract DeploySomniaContracts is Script {
    // Deployment configuration - will be set to actual deployer address
    address public deployer;
    uint256 public constant INITIAL_INTEREST_RATE = 1585489599; // ~5% APR
    uint256 public constant INITIAL_REWARD_RATE = 1e15; // Default reward rate per second
    uint256 public constant INITIAL_EXCHANGE_RATE = 1e18; // 1:1 STT <-> Rebase token

    // Deployed contract addresses (will be set during deployment)
    RebaseToken public rebaseToken;
    Vault public vault;
    SimpleRebaseTokenPool public pool;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        deployer = vm.addr(deployerPrivateKey);

        console.log("Starting deployment on Somnia Testnet...");
        console.log("Deployer address:", deployer);
        console.log("Chain ID:", block.chainid);

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy RebaseToken
        console.log("\n=== Deploying RebaseToken ===");
        rebaseToken = new RebaseToken();
        console.log("RebaseToken deployed at:", address(rebaseToken));
        console.log("RebaseToken name:", rebaseToken.name());
        console.log("RebaseToken symbol:", rebaseToken.symbol());
        console.log("Initial interest rate:", rebaseToken.getInterestRate());

        // Step 2: Deploy Vault
        console.log("\n=== Deploying Vault ===");
        vault = new Vault(address(rebaseToken), deployer);
        console.log("Vault deployed at:", address(vault));
        console.log("Vault owner:", vault.owner());
        console.log("Vault rebase token:", address(vault.i_rebaseToken()));

        // Step 3: Deploy SimpleRebaseTokenPool
        console.log("\n=== Deploying SimpleRebaseTokenPool ===");
        pool = new SimpleRebaseTokenPool(
            vault,
            IRebaseToken(address(rebaseToken)),
            deployer
        );
        console.log("SimpleRebaseTokenPool deployed at:", address(pool));
        console.log("Pool owner:", pool.owner());
        console.log("Pool vault:", address(pool.vault()));
        console.log("Pool rebase token:", address(pool.rebaseToken()));

        // Step 4: Grant necessary roles and permissions
        console.log("\n=== Setting up permissions ===");

        // Grant mint and burn role to vault
        rebaseToken.grantMintAndBurnRole(address(vault));
        console.log("Granted MINT_AND_BURN_ROLE to Vault");

        // Grant mint and burn role to pool (for rewards)
        rebaseToken.grantMintAndBurnRole(address(pool));
        console.log("Granted MINT_AND_BURN_ROLE to Pool");

        // Set pool address in vault
        vault.setPool(address(pool));
        console.log("Set pool address in Vault");

        // Step 5: Verify deployments
        console.log("\n=== Deployment Verification ===");
        console.log("RebaseToken address:", address(rebaseToken));
        console.log("Vault address:", address(vault));
        console.log("SimpleRebaseTokenPool address:", address(pool));

        // Test basic functionality
        console.log("\n=== Testing Basic Functionality ===");

        // Check if vault can call rebase token functions
        uint256 currentRate = rebaseToken.getInterestRate();
        console.log("Current interest rate:", currentRate);
        console.log("Vault can read rebase token: OK");

        // Check pool configuration
        console.log("Pool reward rate:", pool.rewardRate());
        console.log("Pool exchange rate:", pool.exchangeRate());
        console.log("Pool total staked:", pool.totalStaked());

        // Verify vault pool address
        console.log("Vault pool address:", vault.pool());

        vm.stopBroadcast();

        // Step 6: Deployment completed
        console.log("\n=== Deployment Completed Successfully ===");
        console.log("RebaseToken:", address(rebaseToken));
        console.log("Vault:", address(vault));
        console.log("SimpleRebaseTokenPool:", address(pool));
        console.log("Deployer:", deployer);
        console.log("Block Number:", block.number);
        console.log("Timestamp:", block.timestamp);

        // Persist artifacts for frontend and records
        saveDeploymentInfo();
        saveFrontendAddresses();
    }

    /**
     * @notice Save deployment information to a file for frontend integration
     */
    function saveDeploymentInfo() internal {
        string memory json = string.concat(
            "{\n",
            '  "chainId": ',
            vm.toString(block.chainid),
            ",\n",
            '  "rebaseToken": "',
            vm.toString(address(rebaseToken)),
            '",\n',
            '  "vault": "',
            vm.toString(address(vault)),
            '",\n',
            '  "pool": "',
            vm.toString(address(pool)),
            '",\n',
            '  "deployer": "',
            vm.toString(deployer),
            '",\n',
            '  "timestamp": ',
            vm.toString(block.timestamp),
            ",\n",
            '  "blockNumber": ',
            vm.toString(block.number),
            "\n",
            "}"
        );

        vm.writeFile("./deployment-info.json", json);
        console.log("Deployment info saved to deployment-info.json");
    }

    /**
     * @notice Helper function to verify contract deployment
     */
    function verifyDeployment() external view {
        require(address(rebaseToken) != address(0), "RebaseToken not deployed");
        require(address(vault) != address(0), "Vault not deployed");
        require(address(pool) != address(0), "Pool not deployed");

        require(vault.owner() == deployer, "Vault owner incorrect");
        require(pool.owner() == deployer, "Pool owner incorrect");
        require(
            address(vault.i_rebaseToken()) == address(rebaseToken),
            "Vault rebase token incorrect"
        );
        require(
            address(pool.vault()) == address(vault),
            "Pool vault incorrect"
        );
        require(
            address(pool.rebaseToken()) == address(rebaseToken),
            "Pool rebase token incorrect"
        );
        require(vault.pool() == address(pool), "Vault pool address incorrect");

        console.log("All contracts deployed and configured correctly");
    }

    /**
     * @notice Save deployed addresses for frontend consumption
     */
    function saveFrontendAddresses() internal {
        // Overwrites a JSON file keyed by chainId with the latest deployment
        string memory json = string.concat(
            "{\n",
            '  "',
            vm.toString(block.chainid),
            '": {\n',
            '    "rebaseToken": "',
            vm.toString(address(rebaseToken)),
            '",\n',
            '    "vault": "',
            vm.toString(address(vault)),
            '",\n',
            '    "pool": "',
            vm.toString(address(pool)),
            '",\n',
            '    "timestamp": ',
            vm.toString(block.timestamp),
            "\n",
            "  }\n",
            "}\n"
        );

        vm.writeFile("./frontend/src/contracts/deployments.json", json);
        console.log(
            "Frontend addresses saved to frontend/src/contracts/deployments.json"
        );
    }
}
