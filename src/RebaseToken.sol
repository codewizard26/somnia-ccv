//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/*
@title RebaseToken
@author Nikhil Mishra
@notice A cross chain rebase token that incentivizes users to dposit to vault and gain interest on that .
@notice the interest in the smart contract can only be decreased by the owner of the contract.
@notice the each user have there own interest rate that is the global interest rate at the time of deposit.
@dev A simple ERC20 token that can be used for rebase operations.
*/

contract RebaseToken is ERC20, Ownable(msg.sender), AccessControl {
    error RebaseToken__InterestRateCanOnlyDecrease(
        uint256 newInterestRate,
        uint256 oldInterestRate
    );

    uint256 private constant PRECISION_FACTOR = 1e19; // Precision factor to avoid floating point issues
    uint256 private s_interestRate = (5 * PRECISION_FACTOR) / 10e8; // The interest rate for the rebase token

    bytes32 private constant MINT_AND_BURN_ROLE =
        keccak256("MINT_AND_BURN_ROLE");
    mapping(address => uint256) private s_userInterestRate;
    mapping(address => uint256) private s_userLastUpdatedTimestamp;

    event InterestRateChanged(uint256 newInterestRate);

    constructor() ERC20("Rebase Token", "RBT") {}

    function grantMintAndBurnRole(address _account) external onlyOwner {
        _grantRole(MINT_AND_BURN_ROLE, _account);
    }

    /**

    @notice Function to set the interest rate of the rebase token.
    @param _newInterestRate The new interest rate to be set.
    @dev the interest rate can only be decreased, not increased.
    **/

    function setInterestRate(uint256 _newInterestRate) external onlyOwner {
        // set the interest rate
        if (_newInterestRate > s_interestRate) {
            revert RebaseToken__InterestRateCanOnlyDecrease(
                s_interestRate,
                _newInterestRate
            );
        }
        s_interestRate = _newInterestRate;
        emit InterestRateChanged(_newInterestRate);
    }

    /** 
    @notice Function to get the principal balance of the user. this is the number of tokens that have been minted to the user. without interest since last time user interacted with the protocol.
    @param _user the user to get the principal balance of.
    @return the principal balance of the user.
    */

    function principalBalanceOf(address _user) external view returns (uint256) {
        return super.balanceOf(_user);
    }

    function mint(
        address _to,
        uint256 _amount,
        uint256 _userInterestRate
    ) external onlyRole(MINT_AND_BURN_ROLE) {
        _mintAccuredInterest(_to);
        s_userInterestRate[_to] = _userInterestRate; // Set the user's interest rate to the current interest rate
        _mint(_to, _amount);
    }

    /*
    @notice Function to burn the tokens from the user.
    @param _from the user to burn the tokens from.
    @param _amount the amount of tokens to burn.
    @dev The function will mint the accrued interest to the user before burning the tokens.
    */

    function burn(
        address _from,
        uint256 _amount
    ) external onlyRole(MINT_AND_BURN_ROLE) {
        if (_amount == type(uint256).max) {
            _amount = balanceOf(_from);
        }

        _mintAccuredInterest(_from);
        // burn the tokens from the user
        _burn(_from, _amount);
    }

    function _calculateUserAccumlatedInterestSinceLastUpdated(
        address _user
    ) internal view returns (uint256 linearInterest) {
        // we need to calculate amount since last updated
        // get the last updated timestamp of the
        // principal amount + principal amount * interest rate * time elapsed
        // principal amount(1+ (user interest rate * time elapsed))
        uint256 timeElapsed = block.timestamp -
            s_userLastUpdatedTimestamp[_user];
        return
            linearInterest =
                PRECISION_FACTOR +
                (s_userInterestRate[_user] * timeElapsed);
    }

    function balanceOf(address _user) public view override returns (uint256) {
        // get the current principal balance of the user (ie number of tokens actually minted to the user)
        //multiply the principal balance with the interest rate to get the total interest accrued
        return
            (super.balanceOf(_user) *
                _calculateUserAccumlatedInterestSinceLastUpdated(_user)) /
            PRECISION_FACTOR;
    }

    /*
    @notice Function to transfer the tokens from the user to the recipient.
    @param _recipient the address of the recipient.
    @param _amount the amount of tokens to transfer.
    @dev The function will mint the accrued interest to the user and the recipient before transferring the tokens.
    @dev If the amount is set to type(uint256).max, it will transfer the entire balance of the user.
    */

    function transfer(
        address _recipient,
        uint256 _amount
    ) public override returns (bool) {
        _mintAccuredInterest(msg.sender);
        _mintAccuredInterest(_recipient);
        if (_amount == type(uint256).max) {
            _amount = balanceOf(msg.sender);
        }

        if (balanceOf(_recipient) == 0) {
            s_userInterestRate[_recipient] = s_userInterestRate[msg.sender];
        }
        return super.transfer(_recipient, _amount);
    }

    function transferFrom(
        address _sender,
        address _recipient,
        uint256 amount
    ) public override returns (bool) {
        _mintAccuredInterest(_sender);
        _mintAccuredInterest(_recipient);
        if (amount == type(uint256).max) {
            amount = balanceOf(_sender);
        }
        if (balanceOf(_recipient) == 0) {
            s_userInterestRate[_recipient] = s_userInterestRate[_sender];
        }
        return super.transferFrom(_sender, _recipient, amount);
    }

    function _mintAccuredInterest(address _user) internal {
        uint256 previousPrincipalBalance = super.balanceOf(_user);
        uint256 currentBalance = balanceOf(_user);

        uint256 balanceIncrease = currentBalance - previousPrincipalBalance;

        s_userLastUpdatedTimestamp[_user] = block.timestamp;
        _mint(_user, balanceIncrease);
    }

    function getInterestRate() external view returns (uint256) {
        return s_interestRate;
    }

    function getUserInterestRate(
        address _user
    ) external view returns (uint256) {
        return s_userInterestRate[_user];
    }
}
