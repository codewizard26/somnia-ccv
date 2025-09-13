// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Vault} from "./Vault.sol";
import {IRebaseToken} from "./interfaces/IRebaseToken.sol";

contract SimpleRebaseTokenPool is Ownable {
    Vault public immutable vault;
    IRebaseToken public immutable rebaseToken;

    mapping(address => uint256) public stakedBalances;
    mapping(address => uint256) public lastStakeTime;
    uint256 public totalStaked;
    uint256 public rewardRate; // reward per second
    uint256 public exchangeRate; // STT per rebase token (scaled to 1e18)

    event TokensDeposited(
        address indexed user,
        uint256 sttAmount,
        uint256 rebaseTokenAmount
    );
    event TokensWithdrawn(
        address indexed user,
        uint256 rebaseTokenAmount,
        uint256 sttAmount
    );
    event RewardRateUpdated(uint256 newRate);
    event ExchangeRateUpdated(uint256 newRate);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(
        Vault _vault,
        IRebaseToken _rebaseToken,
        address _owner
    ) Ownable(_owner) {
        vault = _vault;
        rebaseToken = _rebaseToken;
        rewardRate = 1e15; // Default reward rate per second
        exchangeRate = 1e18; // 1:1 STT <-> Rebase token
    }

    /**
     * @notice Deposit STT into vault and mint rebase tokens to user.
     */
    function depositSTTForRebaseTokens() external payable {
        require(msg.value > 0, "Must deposit some STT");

        uint256 rebaseTokenAmount = (msg.value * 1e18) / exchangeRate;

        // Get vault balance before deposit
        uint256 vaultBalanceBefore = address(vault).balance;

        // Call vault depositFor function with the sent value
        vault.depositFor{value: msg.value}(msg.sender, rebaseTokenAmount);

        // Verify the vault received the funds
        uint256 vaultBalanceAfter = address(vault).balance;
        require(
            vaultBalanceAfter == vaultBalanceBefore + msg.value,
            "Vault did not receive funds"
        );

        emit TokensDeposited(msg.sender, msg.value, rebaseTokenAmount);
    }

    /**
     * @notice Withdraw STT by redeeming rebase tokens via vault.
     */
    function withdrawSTTForRebaseTokens(uint256 rebaseTokenAmount) external {
        require(rebaseTokenAmount > 0, "Invalid amount");

        uint256 sttAmount = (rebaseTokenAmount * exchangeRate) / 1e18;

        vault.redeemFor(msg.sender, rebaseTokenAmount, sttAmount);

        emit TokensWithdrawn(msg.sender, rebaseTokenAmount, sttAmount);
    }

    /**
     * @notice Stake rebase tokens to earn rewards
     */
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        bool success = rebaseToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "Transfer failed");

        _updateRewards(msg.sender);

        stakedBalances[msg.sender] += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstake and withdraw rebase tokens
     */
    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(stakedBalances[msg.sender] >= amount, "Insufficient balance");

        _updateRewards(msg.sender);

        stakedBalances[msg.sender] -= amount;
        totalStaked -= amount;

        rebaseToken.transferFrom(address(this), msg.sender, amount);

        emit Unstaked(msg.sender, amount);
    }

    function _updateRewards(address user) internal {
        lastStakeTime[user] = block.timestamp;
    }

    function setExchangeRate(uint256 newRate) external onlyOwner {
        exchangeRate = newRate;
        emit ExchangeRateUpdated(newRate);
    }

    /**
     * @notice Get the balance of STT in this pool contract
     */
    function getPoolBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Emergency function to rescue stuck STT from pool
     */
    function rescueStuckSTT() external onlyOwner {
        uint256 stuckBalance = address(this).balance;
        require(stuckBalance > 0, "No stuck funds");

        // Send stuck funds to vault
        (bool success, ) = payable(address(vault)).call{value: stuckBalance}(
            ""
        );
        require(success, "Transfer to vault failed");
    }

    // will be implemented later ones the cross chain functionality is implemented so that users can claim rewards from other chains
    // /**
    //  * @notice Claim accumulated rewards
    //  */
    // function claimRewards() external {
    //     uint256 reward = _calculateReward(msg.sender);
    //     lastStakeTime[msg.sender] = block.timestamp;

    //     if (reward > 0) {
    //         // Mint rewards as new rebase tokens
    //         rebaseToken.mint(msg.sender, reward, rebaseToken.getInterestRate());
    //         emit RewardsClaimed(msg.sender, reward);
    //     }
    // }

    // function _updateRewards(address user) internal {
    //     lastStakeTime[user] = block.timestamp;
    // }

    // function _calculateReward(address user) internal view returns (uint256) {
    //     uint256 staked = stakedBalances[user];
    //     uint256 duration = block.timestamp - lastStakeTime[user];
    //     return (staked * rewardRate * duration) / 1e18;
    // }

    // function setRewardRate(uint256 newRate) external onlyOwner {
    //     rewardRate = newRate;
    //     emit RewardRateUpdated(newRate);
    // }
}
