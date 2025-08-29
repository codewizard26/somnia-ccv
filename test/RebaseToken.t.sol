//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {Test, console} from "forge-std/Test.sol";
import {RebaseToken} from "../src/RebaseToken.sol";
import {Vault} from "../src/Vault.sol";
import {IRebaseToken} from "../src/interfaces/IRebaseToken.sol";

contract RebaseTokenTest is Test {
    RebaseToken private rebaseToken;
    Vault private vault;

    address public owner = makeAddr("owner");
    address public user = makeAddr("user");

    function setUp() public {
        vm.startPrank(owner);
        rebaseToken = new RebaseToken();
        vault = new Vault(IRebaseToken(address(rebaseToken)));
        rebaseToken.grantMintAndBurnRole(address(vault));
        vm.stopPrank();
    }

    function addRewardsToVault(uint256 rewardAmount) public {
        (bool success, ) = payable(address(vault)).call{value: rewardAmount}(
            ""
        );
    }

    function testDepositLinear(uint256 amount) public {
        // bound the amount to a reasonable range
        amount = bound(amount, 1e5, type(uint96).max);
        // deposit 1 ether to the vault
        vm.startPrank(user);
        vm.deal(user, amount);
        vault.deposit{value: amount}();

        // check the rebase token balance of the user

        uint256 startBalance = rebaseToken.balanceOf(user);
        console.log("User balance after deposit: ", startBalance);
        assertEq(startBalance, amount);

        // warp the time and check the balance
        vm.warp(block.timestamp + 1 hours);
        uint256 middleBalance = rebaseToken.balanceOf(user);
        console.log("User balance after 1 hour: ", middleBalance);
        assertGt(middleBalance, startBalance);

        // warp the time again by the same amount and check the balance again
        vm.warp(block.timestamp + 1 hours);
        uint256 endBalance = rebaseToken.balanceOf(user);
        console.log("User balance after 2 hours: ", endBalance);
        assertGt(endBalance, startBalance);

        assertApproxEqAbs(
            endBalance - middleBalance,
            middleBalance - startBalance,
            1
        );

        vm.stopPrank();
    }

    function testRedeemStraightAway(uint256 amount) public {
        amount = bound(amount, 1e5, type(uint96).max);
        //deposit 1 ether to the vault
        vm.deal(user, amount);

        vm.prank(user);
        vault.deposit{value: amount}();

        assertEq(rebaseToken.balanceOf(user), amount);

        //redeem
        vm.prank(user);
        vault.redeem(type(uint256).max);
        assertEq(rebaseToken.balanceOf(user), 0);
        assertEq(address(user).balance, amount);
    }

    function testReedemAfterTimePassed(
        uint256 depositAmount,
        uint256 time
    ) public {
        time = bound(time, 1000, type(uint96).max);
        depositAmount = bound(depositAmount, 1e5, type(uint96).max);

        vm.deal(user, depositAmount);
        vm.prank(user);
        vault.deposit{value: depositAmount}();

        // warp any time
        vm.warp(block.timestamp + time);
        uint256 balanceAfterSomeTime = rebaseToken.balanceOf(user);

        vm.deal(owner, balanceAfterSomeTime - depositAmount);
        vm.prank(owner);
        addRewardsToVault(balanceAfterSomeTime - depositAmount);
        console.log("User balance after time passed: ", balanceAfterSomeTime);
        vm.prank(user);
        vault.redeem(type(uint256).max);

        uint256 ethBalance = address(user).balance;
        assertEq(
            ethBalance,
            balanceAfterSomeTime,
            "User should receive the same amount of Eth as the balance of the rebase token"
        );

        assertGt(ethBalance, depositAmount);

        vm.stopPrank();
    }

    function testTransfer(uint256 amount, uint256 amountToSend) public {
        amount = bound(amount, 1e5 + 1e5, type(uint96).max);
        amountToSend = bound(amountToSend, 1e5, amount - 1e5);

        //deposit

        vm.deal(user, amount);
        vm.prank(user);
        vault.deposit{value: amount}();

        //testTransfer
        address user2 = makeAddr("user2");
        uint256 userBalance = rebaseToken.balanceOf(user);
        uint256 user2BalanceBefore = rebaseToken.balanceOf(user2);
        console.log("User2 balance before transfer: ", user2BalanceBefore);
        assertEq(userBalance, amount);
        assertEq(user2BalanceBefore, 0);

        uint256 currentInterestRate = rebaseToken.getUserInterestRate(user);
        console.log(
            "User interest rate before transfer: ",
            currentInterestRate
        );

        // owner reduces the interest rate
        vm.prank(owner);
        rebaseToken.setInterestRate(4e10);

        vm.prank(user);
        rebaseToken.transfer(user2, amountToSend);
        uint256 user2BalanceAfterTransfer = rebaseToken.balanceOf(user2);
        uint256 userBalanceAfterTransfer = rebaseToken.balanceOf(user);
        assertEq(userBalanceAfterTransfer, userBalance - amountToSend);
        assertEq(user2BalanceAfterTransfer, amountToSend);

        //check the user interest rate has been inherited and is 5e10 not 4e10
        uint256 user2InterestRate = rebaseToken.getUserInterestRate(user2);
        assertEq(
            user2InterestRate,
            5e10,
            "User2 should have inherited the interest rate"
        );
    }

    function testCannotSetgetInterestRateInterestRate(
        uint256 newInterestRate
    ) public {
        vm.prank(user);
        vm.expectRevert();
        rebaseToken.setInterestRate(newInterestRate);
    }

    function testCannotCallMintAndBurn() public {
        vm.prank(user);
        vm.expectRevert();
        rebaseToken.mint(user, 1e18, rebaseToken.getInterestRate());

        vm.prank(user);
        vm.expectRevert();
        rebaseToken.burn(user, 1e18);
    }
}
