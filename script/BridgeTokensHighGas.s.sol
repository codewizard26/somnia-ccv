// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {IRouterClient} from "@ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/contracts/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";

contract BridgeTokensHighGasScript is Script {
    function run(
        address receiverAddress,
        uint64 destinationChainSelector,
        address tokenToSendAddress,
        uint256 amountToSend,
        address linkTokenAddress,
        address routerAddress
    ) public {
        // struct EVM2AnyMessage {
        //     bytes receiver; // abi.encode(receiver address) for dest EVM chains
        //     bytes data; // Data payload
        //     EVMTokenAmount[] tokenAmounts; // Token transfers
        //     address feeToken; // Address of feeToken. address(0) means you will send msg.value.
        //     bytes extraArgs; // Populate this with _argsToBytes(EVMExtraArgsV2)
        // }
        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](1);
        tokenAmounts[0] = Client.EVMTokenAmount({
            token: tokenToSendAddress,
            amount: amountToSend
        });

        vm.startBroadcast();

        // Try with no gas limit specified (let CCIP handle it)
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverAddress),
            data: "",
            tokenAmounts: tokenAmounts,
            feeToken: linkTokenAddress,
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0})) // No gas limit specified
        });

        // Get maximum LINK balance and use it as fee
        uint256 maxBalance = IERC20(linkTokenAddress).balanceOf(msg.sender);

        // Log the attempt
        console.log("Attempting CCIP bridge with:");
        console.log("Receiver:", receiverAddress);
        console.log("Destination Chain:", destinationChainSelector);
        console.log("Token:", tokenToSendAddress);
        console.log("Amount:", amountToSend);
        console.log("LINK Balance:", maxBalance);
        console.log("Router:", routerAddress);
        console.log("Gas Limit: 0 (let CCIP handle)");

        // Approve maximum amount for fees
        IERC20(linkTokenAddress).approve(routerAddress, maxBalance);
        IERC20(tokenToSendAddress).approve(routerAddress, amountToSend);

        // Try to send with maximum fees
        IRouterClient(routerAddress).ccipSend(
            destinationChainSelector,
            message
        );
        vm.stopBroadcast();
    }
}
