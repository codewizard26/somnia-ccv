// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IRebaseToken} from "./interfaces/IRebaseToken.sol";

error Vault__NoFundsSent();
error Vault__RedeemFailed();

contract Vault is Ownable {
    IRebaseToken public immutable i_rebaseToken;
    address public pool;

    event Deposit(
        address indexed user,
        uint256 sttAmount,
        uint256 rebaseTokenAmount
    );
    event Redeem(
        address indexed user,
        uint256 sttAmount,
        uint256 rebaseTokenAmount
    );

    modifier onlyPool() {
        require(msg.sender == pool, "Only pool can call this function");
        _;
    }

    constructor(address _rebaseToken, address _owner) Ownable(_owner) {
        i_rebaseToken = IRebaseToken(_rebaseToken);
    }

    /**
     * @notice Set the pool address (only owner can call)
     */
    function setPool(address _pool) external onlyOwner {
        pool = _pool;
    }

    /**
     * @notice Called by pool to deposit STT and mint rebase tokens for user.
     * @param user Address of the user
     * @param rebaseTokenAmount Amount of rebase tokens to mint
     */
    function depositFor(
        address user,
        uint256 rebaseTokenAmount
    ) external payable onlyPool {
        if (msg.value == 0) revert Vault__NoFundsSent();

        // Mint rebase tokens to the user
        i_rebaseToken.mint(
            user,
            rebaseTokenAmount,
            i_rebaseToken.getInterestRate()
        );

        emit Deposit(user, msg.value, rebaseTokenAmount);
    }

    /**
     * @notice Called by pool to redeem user's rebase tokens and return STT.
     * @param user Address of the user
     * @param rebaseTokenAmount Amount of rebase tokens to burn
     * @param sttAmount Amount of STT to send back
     */
    function redeemFor(
        address user,
        uint256 rebaseTokenAmount,
        uint256 sttAmount
    ) external onlyPool {
        // Burn rebase tokens from the user
        i_rebaseToken.burn(user, rebaseTokenAmount);

        // Send STT back to user
        (bool success, ) = payable(user).call{value: sttAmount}("");
        if (!success) revert Vault__RedeemFailed();

        emit Redeem(user, sttAmount, rebaseTokenAmount);
    }

    /**
     * @notice View function to get total STT in the vault
     */
    function totalAssets() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
