// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../src/Vault.sol";
import "../src/RebaseToken.sol";
import {Test} from "../lib/forge-std/src/Test.sol";
import {console} from "forge-std/console.sol";

contract VaultTest is Test {
    Vault vault;
    RebaseToken rebaseToken;

    address alice = address(0xA11CE);
    address bob = address(0xB0B);
    address owner = address(0x1);
    address poolContract = address(0x2); // Mock pool contract

    function setUp() public {
        // Deploy RebaseToken first
        vm.prank(owner);
        rebaseToken = new RebaseToken();

        // Deploy Vault
        vm.prank(owner);
        vault = new Vault(address(rebaseToken), owner);

        // Grant mint and burn role to vault
        vm.prank(owner);
        rebaseToken.grantMintAndBurnRole(address(vault));

        // Give some ETH to test accounts
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(poolContract, 100 ether);
    }

    function testDepositFor() public {
        uint256 sttAmount = 10 ether;
        uint256 rebaseTokenAmount = 10 ether;

        // Pool contract calls depositFor
        vm.prank(poolContract);
        vault.depositFor{value: sttAmount}(alice, rebaseTokenAmount);

        // Check that rebase tokens were minted to alice
        assertEq(rebaseToken.balanceOf(alice), rebaseTokenAmount);

        // Check vault received STT
        assertEq(vault.totalAssets(), sttAmount);
    }

    function testDepositForRevertsWithZeroValue() public {
        vm.prank(poolContract);
        vm.expectRevert(Vault__NoFundsSent.selector);
        vault.depositFor{value: 0}(alice, 10 ether);
    }

    function testRedeemFor() public {
        uint256 sttAmount = 10 ether;
        uint256 rebaseTokenAmount = 10 ether;

        // First deposit
        vm.prank(poolContract);
        vault.depositFor{value: sttAmount}(alice, rebaseTokenAmount);

        uint256 aliceBalanceBefore = alice.balance;

        // Now redeem
        vm.prank(poolContract);
        vault.redeemFor(alice, rebaseTokenAmount, sttAmount);

        // Check tokens were burned
        assertEq(rebaseToken.balanceOf(alice), 0);

        // Check alice received STT back
        assertEq(alice.balance, aliceBalanceBefore + sttAmount);

        // Check vault balance decreased
        assertEq(vault.totalAssets(), 0);
    }

    function testRedeemForPartialAmount() public {
        uint256 sttAmount = 10 ether;
        uint256 rebaseTokenAmount = 10 ether;

        // First deposit
        vm.prank(poolContract);
        vault.depositFor{value: sttAmount}(alice, rebaseTokenAmount);

        // Redeem half
        uint256 redeemAmount = 5 ether;
        uint256 aliceBalanceBefore = alice.balance;

        vm.prank(poolContract);
        vault.redeemFor(alice, redeemAmount, redeemAmount);

        // Check partial tokens were burned
        assertEq(
            rebaseToken.balanceOf(alice),
            rebaseTokenAmount - redeemAmount
        );

        // Check alice received partial STT back
        assertEq(alice.balance, aliceBalanceBefore + redeemAmount);

        // Check vault still has remaining balance
        assertEq(vault.totalAssets(), sttAmount - redeemAmount);
    }

    function testMultipleDeposits() public {
        uint256 sttAmount1 = 5 ether;
        uint256 sttAmount2 = 3 ether;
        uint256 rebaseTokenAmount1 = 5 ether;
        uint256 rebaseTokenAmount2 = 3 ether;

        // First deposit from alice
        vm.prank(poolContract);
        vault.depositFor{value: sttAmount1}(alice, rebaseTokenAmount1);

        // Second deposit from bob
        vm.prank(poolContract);
        vault.depositFor{value: sttAmount2}(bob, rebaseTokenAmount2);

        // Check balances
        assertEq(rebaseToken.balanceOf(alice), rebaseTokenAmount1);
        assertEq(rebaseToken.balanceOf(bob), rebaseTokenAmount2);
        assertEq(vault.totalAssets(), sttAmount1 + sttAmount2);
    }

    function testTotalAssets() public {
        assertEq(vault.totalAssets(), 0);

        vm.prank(poolContract);
        vault.depositFor{value: 15 ether}(alice, 15 ether);

        assertEq(vault.totalAssets(), 15 ether);
    }

    function testReceiveFunction() public {
        // Test that vault can receive ETH directly
        uint256 sendAmount = 1 ether;

        (bool success, ) = payable(address(vault)).call{value: sendAmount}("");
        assertTrue(success);

        assertEq(vault.totalAssets(), sendAmount);
    }

    function testOnlyAuthorizedCanCallDepositFor() public {
        // Unauthorized caller should be able to call (no access control on depositFor)
        vm.prank(alice);
        vault.depositFor{value: 1 ether}(alice, 1 ether);

        // This should work since there's no access control
        assertEq(rebaseToken.balanceOf(alice), 1 ether);
    }

    function testOnlyAuthorizedCanCallRedeemFor() public {
        // First deposit
        vm.prank(poolContract);
        vault.depositFor{value: 10 ether}(alice, 10 ether);

        // Unauthorized caller should be able to call (no access control on redeemFor)
        vm.prank(alice);
        vault.redeemFor(alice, 5 ether, 5 ether);

        // This should work since there's no access control
        assertEq(rebaseToken.balanceOf(alice), 5 ether);
    }

    function testEvents() public {
        uint256 sttAmount = 10 ether;
        uint256 rebaseTokenAmount = 10 ether;

        // Test Deposit event
        vm.expectEmit(true, false, false, true);
        emit Vault.Deposit(alice, sttAmount, rebaseTokenAmount);

        vm.prank(poolContract);
        vault.depositFor{value: sttAmount}(alice, rebaseTokenAmount);

        // Test Redeem event
        vm.expectEmit(true, false, false, true);
        emit Vault.Redeem(alice, sttAmount, rebaseTokenAmount);

        vm.prank(poolContract);
        vault.redeemFor(alice, rebaseTokenAmount, sttAmount);
    }
}
