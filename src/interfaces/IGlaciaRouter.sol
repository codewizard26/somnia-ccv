// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IGlaciaRouter {
    function send(uint64 dstChainId, bytes calldata data) external payable;
}

