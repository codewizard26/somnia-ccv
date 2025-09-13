// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../src/RebaseToken.sol";
import {Test} from "../lib/forge-std/src/Test.sol";
import {console} from "forge-std/console.sol";

contract RebaseTokenTest is Test {
    RebaseToken token;
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        token = new RebaseToken();
        token.grantMintAndBurnRole(address(this));

        // Mint 100e18 principal to Alice at default 5% APR
        token.mint(alice, 100 ether, token.getInterestRate());
    }

    function testTokenMintedCorrectly() public view {
        console.log("Alice's token balance:", token.balanceOf(address(alice)));
        assertEq(token.balanceOf(address(alice)), 100 ether);
    }

    function testAccruesLinearly() public {
        uint256 bal0 = token.balanceOf(alice);
        assertEq(bal0, 100 ether);

        // warp half a year
        vm.warp(block.timestamp + 182 days + 12 hours);

        // displayed should be ~102.5e18 for 5% APR half-year
        uint256 bal1 = token.balanceOf(alice);
        assertApproxEqRel(bal1, 102.5 ether, 1e14); // Changed from 102_5e16 * 1e2
    }

    function testMintAccruesThenTransferPrincipal() public {
        // advance time then realize interest via transfer
        vm.warp(block.timestamp + 100 days);
        vm.prank(alice);
        token.transfer(bob, 10 ether);

        // Bob should inherit Alice's user rate
        assertEq(
            token.getUserInterestRate(bob),
            token.getUserInterestRate(alice)
        );
        // Principal moved to Bob
        assertEq(token.principalBalanceOf(bob), 10 ether);
    }

    function testBurnMaxBurnsAllPrincipal() public {
        // fast-forward and then burn max principal
        vm.warp(block.timestamp + 50 days);
        uint256 currentBalance = token.balanceOf(alice);
        token.burn(alice, currentBalance);
        assertEq(token.principalBalanceOf(alice), 0);
    }
}
