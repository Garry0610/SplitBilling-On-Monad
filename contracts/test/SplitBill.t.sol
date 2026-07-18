// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SplitBill.sol";

contract SplitBillTest is Test {
    SplitBill splitBill;

    address organizer = address(0x1);
    address alice = address(0x2);
    address bob = address(0x3);

    function setUp() public {
        splitBill = new SplitBill();
        vm.deal(organizer, 10 ether);
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testCreateBill() public {
        vm.prank(organizer);
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 1 ether;
        shares[1] = 1 ether;

        uint256 billId = splitBill.createBill("Test dinner", participants, shares);

        (address org,, uint256 total,, bool settled, bool cancelled,) = splitBill.getBill(billId);
        assertEq(org, organizer);
        assertEq(total, 2 ether);
        assertEq(settled, false);
        assertEq(cancelled, false);
    }

    function testPaySplitSettlesWhenFull() public {
        vm.prank(organizer);
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 1 ether;
        shares[1] = 1 ether;

        uint256 billId = splitBill.createBill("Test dinner", participants, shares);

        vm.prank(alice);
        splitBill.paySplit{value: 1 ether}(billId);

        vm.prank(bob);
        splitBill.paySplit{value: 1 ether}(billId);

        (, , , uint256 paidAmount, bool settled, bool cancelled,) = splitBill.getBill(billId);
        assertEq(paidAmount, 2 ether);
        assertEq(settled, true);
        assertEq(cancelled, false);
        assertEq(organizer.balance, 12 ether); // 10 starting (from setUp's vm.deal) + 2 ether settled
    }

    function testRevertsOnWrongAmount() public {
        vm.prank(organizer);
        address[] memory participants = new address[](1);
        participants[0] = alice;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;

        uint256 billId = splitBill.createBill("Solo bill", participants, shares);

        vm.prank(alice);
        vm.expectRevert(SplitBill.WrongAmount.selector);
        splitBill.paySplit{value: 0.5 ether}(billId);
    }

    function testRevertsOnDuplicateParticipant() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = alice;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 1 ether;
        shares[1] = 1 ether;

        vm.expectRevert(SplitBill.DuplicateParticipant.selector);
        splitBill.createBill("Duplicate test", participants, shares);
    }

    function testRevertsOnZeroAddressParticipant() public {
        address[] memory participants = new address[](1);
        participants[0] = address(0);

        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;

        vm.expectRevert(SplitBill.ZeroAddressParticipant.selector);
        splitBill.createBill("Zero address test", participants, shares);
    }

    function testRevertsOnZeroShare() public {
        address[] memory participants = new address[](1);
        participants[0] = alice;

        uint256[] memory shares = new uint256[](1);
        shares[0] = 0;

        vm.expectRevert(SplitBill.ZeroShare.selector);
        splitBill.createBill("Zero share test", participants, shares);
    }

    function testCancelRefundsPartialPayments() public {
        vm.prank(organizer);
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 1 ether;
        shares[1] = 1 ether;

        uint256 billId = splitBill.createBill("Cancel test", participants, shares);

        // Only alice pays; bob never does.
        vm.prank(alice);
        splitBill.paySplit{value: 1 ether}(billId);

        uint256 aliceBalanceBeforeCancel = alice.balance;

        vm.prank(organizer);
        splitBill.cancelBill(billId);

        (, , , uint256 paidAmount, bool settled, bool cancelled,) = splitBill.getBill(billId);
        // paidAmount is intentionally left as the total that was refunded,
        // for display purposes (see the contract's note on cancelBill).
        assertEq(paidAmount, 1 ether);
        assertEq(settled, false);
        assertEq(cancelled, true);
        // Alice gets her 1 ether back.
        assertEq(alice.balance, aliceBalanceBeforeCancel + 1 ether);
    }

    function testCancelRevertsForNonOrganizer() public {
        vm.prank(organizer);
        address[] memory participants = new address[](1);
        participants[0] = alice;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;

        uint256 billId = splitBill.createBill("Not yours", participants, shares);

        vm.prank(alice);
        vm.expectRevert(SplitBill.NotOrganizer.selector);
        splitBill.cancelBill(billId);
    }

    function testCancelRevertsIfAlreadySettled() public {
        vm.prank(organizer);
        address[] memory participants = new address[](1);
        participants[0] = alice;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;

        uint256 billId = splitBill.createBill("Fully paid", participants, shares);

        vm.prank(alice);
        splitBill.paySplit{value: 1 ether}(billId);

        vm.prank(organizer);
        vm.expectRevert(SplitBill.AlreadySettled.selector);
        splitBill.cancelBill(billId);
    }

    function testPaySplitRevertsAfterCancel() public {
        vm.prank(organizer);
        address[] memory participants = new address[](1);
        participants[0] = alice;
        uint256[] memory shares = new uint256[](1);
        shares[0] = 1 ether;

        uint256 billId = splitBill.createBill("Cancelled bill", participants, shares);

        vm.prank(organizer);
        splitBill.cancelBill(billId);

        vm.prank(alice);
        vm.expectRevert(SplitBill.BillIsCancelled.selector);
        splitBill.paySplit{value: 1 ether}(billId);
    }
}
