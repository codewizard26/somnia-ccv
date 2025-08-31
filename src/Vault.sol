//SPDX-LICENSE-IDENTIFIER: MIT
pragma solidity ^0.8.0;
import {IRebaseToken} from "./interfaces/IRebaseToken.sol";

contract Vault {
    //we need to pass the token address to the constructor
    // create a deposit function that will mint the exact amount of the token to the user equal to the amount of Eth they sent.
    // create a redeem function that will burn the tokens and send the user the Eth they deposited.
    // create a way to add reward to the vault.

    error VAULT__RedeemFailed();

    IRebaseToken private immutable i_rebaseToken;
    event Deposit(address indexed user, uint256 amount);
    event Redeem(address indexed user, uint256 amount);

    constructor(IRebaseToken _rebaseToken) {
        i_rebaseToken = _rebaseToken;
    }

    receive() external payable {}

    function deposit() external payable {
        // Accept native 0G tokens (or any native token of the network)
        require(
            msg.value > 0,
            "You need to send some native tokens to deposit"
        );
        uint256 userInterestRate = i_rebaseToken.getInterestRate();
        i_rebaseToken.mint(msg.sender, msg.value, userInterestRate);
        emit Deposit(msg.sender, msg.value);
    }

    function redeem(uint256 _rbtAmount) external {
        if (_rbtAmount == type(uint256).max) {
            _rbtAmount = i_rebaseToken.balanceOf(msg.sender);
        }

        // Get the user's RBT balance including accrued interest
        uint256 userRBTBalance = i_rebaseToken.balanceOf(msg.sender);
        require(_rbtAmount <= userRBTBalance, "Insufficient RBT balance");

        // Get the user's principal balance (without interest)
        uint256 userPrincipalBalance = i_rebaseToken.principalBalanceOf(
            msg.sender
        );

        // Calculate the ratio of the user's principal to total principal
        uint256 totalPrincipalSupply = i_rebaseToken.totalSupply();
        uint256 vaultBalance = address(this).balance;

        // Calculate how much 0G this user's principal represents
        uint256 userShareOfVault = (userPrincipalBalance * vaultBalance) /
            totalPrincipalSupply;

        // Calculate the ratio of RBT being withdrawn to user's total RBT
        uint256 withdrawalRatio = (_rbtAmount * 1e18) / userRBTBalance;

        // Calculate the 0G amount to send based on the withdrawal ratio
        uint256 ogAmountToSend = (userShareOfVault * withdrawalRatio) / 1e18;

        // Burn the RBT tokens (this will automatically handle interest accrual)
        i_rebaseToken.burn(msg.sender, _rbtAmount);

        // Send the calculated 0G amount
        (bool success, ) = payable(msg.sender).call{value: ogAmountToSend}("");
        if (!success) {
            revert VAULT__RedeemFailed();
        }

        emit Redeem(msg.sender, ogAmountToSend);
    }

    function getRebaseTokenAddress() external view returns (address) {
        return address(i_rebaseToken);
    }

    // Helper function to calculate how much 0G you would get for your RBT
    function calculateRedeemAmount(
        uint256 _rbtAmount
    ) external view returns (uint256) {
        uint256 userRBTBalance = i_rebaseToken.balanceOf(msg.sender);
        if (userRBTBalance == 0) return 0;

        uint256 userPrincipalBalance = i_rebaseToken.principalBalanceOf(
            msg.sender
        );
        uint256 totalPrincipalSupply = i_rebaseToken.totalSupply();
        uint256 vaultBalance = address(this).balance;

        if (totalPrincipalSupply == 0) return 0;

        uint256 userShareOfVault = (userPrincipalBalance * vaultBalance) /
            totalPrincipalSupply;
        uint256 withdrawalRatio = (_rbtAmount * 1e18) / userRBTBalance;

        return (userShareOfVault * withdrawalRatio) / 1e18;
    }

    // Function to get vault balance
    function getVaultBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
