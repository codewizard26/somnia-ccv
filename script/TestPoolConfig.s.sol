// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TokenPool} from "@ccip/contracts/src/v0.8/ccip/pools/TokenPool.sol";
import {RateLimiter} from "@ccip/contracts/src/v0.8/ccip/libraries/RateLimiter.sol";

contract TestPoolConfig is Script {
    function run(address poolAddress) public {
        vm.startBroadcast();

        // Test if the pool supports a specific chain
        uint64 testChainSelector = 12532609583862916517; // Galileo
        bool isSupported = TokenPool(poolAddress).isSupportedChain(
            testChainSelector
        );
        console.log("Pool supports Galileo chain:", isSupported);

        // Get all supported chains
        uint64[] memory supportedChains = TokenPool(poolAddress)
            .getSupportedChains();
        console.log("Number of supported chains:", supportedChains.length);
        for (uint i = 0; i < supportedChains.length; i++) {
            console.log("Supported chain:", supportedChains[i]);
        }

        // Get pool owner
        address owner = TokenPool(poolAddress).owner();
        console.log("Pool owner:", owner);

        // Get pool token
        address token = address(TokenPool(poolAddress).getToken());
        console.log("Pool token:", token);

        vm.stopBroadcast();
    }
}
