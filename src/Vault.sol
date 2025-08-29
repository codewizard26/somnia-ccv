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
        // we need to use the amount of Eth the user has sent to the mint  tokens to the user.abi
        require(msg.value > 0, "You need to send some Eth to deposit");
        uint256 userInterestRate = i_rebaseToken.getInterestRate();
        i_rebaseToken.mint(msg.sender, msg.value, userInterestRate);
        emit Deposit(msg.sender, msg.value);
    }

    function redeem(uint256 _amount) external {
        if (_amount == type(uint256).max) {
            _amount = i_rebaseToken.balanceOf(msg.sender);
        }
        i_rebaseToken.burn(msg.sender, _amount);
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        if (!success) {
            revert VAULT__RedeemFailed();
        }

        emit Redeem(msg.sender, _amount);
    }

    function getRebaseTokenAddress() external view returns (address) {
        return address(i_rebaseToken);
    }
}
