// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {IRouterClient} from "@ccip/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {Client} from "@ccip/contracts/src/v0.8/ccip/libraries/Client.sol";
import {IERC20} from "@ccip/contracts/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";

contract BridgeTokensNativeFeeScript is Script {
    function run(
        address receiverAddress,
        uint64 destinationChainSelector,
        address tokenToSendAddress,
        uint256 amountToSend,
        address routerAddress
    ) public {
        // Galileo LINK token address
        address galileoLinkAddress = 0xd211Bd4ff8fd68C16016C5c7a66b6e10F6227C49;

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
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(receiverAddress),
            data: "",
            tokenAmounts: tokenAmounts,
            feeToken: galileoLinkAddress, // Use LINK token for fees
            extraArgs: Client._argsToBytes(Client.EVMExtraArgsV1({gasLimit: 0}))
        });

        // Get maximum LINK balance available and use it as fee
        uint256 maxBalance = IERC20(galileoLinkAddress).balanceOf(msg.sender);
        uint256 ccipFee = maxBalance;

        // Approve the token transfer
        IERC20(tokenToSendAddress).approve(routerAddress, amountToSend);

        // Approve the LINK token for fees (using maximum balance)
        IERC20(galileoLinkAddress).approve(routerAddress, ccipFee);

        // Send the CCIP message
        IRouterClient(routerAddress).ccipSend(
            destinationChainSelector,
            message
        );
        vm.stopBroadcast();
    }
}
