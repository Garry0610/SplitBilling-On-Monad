// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title SplitBill
/// @notice Minimal on-chain bill splitting. One organizer creates a bill,
///         participants pay their exact share, contract tracks paid status
///         and releases funds to the organizer once fully settled. The
///         organizer can cancel an unsettled bill, which refunds everyone
///         who already paid — this prevents funds getting stuck forever
///         if some participants never pay.
contract SplitBill {
    struct Bill {
        address organizer;
        string label;           // e.g. "Friday dinner"
        uint256 totalAmount;    // in wei
        uint256 paidAmount;     // total ever paid in. After a cancel, this
                                 // stays put (it's no longer "currently
                                 // held" but doubles as "amount refunded"
                                 // for display, since nothing else reads
                                 // it once cancelled is true).
        bool settled;           // true once fully paid and funds released
        bool cancelled;         // true once the organizer cancels
        address[] participants;
    }

    uint256 public billCount;

    mapping(uint256 => Bill) private bills;
    mapping(uint256 => mapping(address => uint256)) public shareOwed;
    mapping(uint256 => mapping(address => uint256)) public amountPaid;

    event BillCreated(uint256 indexed billId, address indexed organizer, string label, uint256 totalAmount);
    event SharePaid(uint256 indexed billId, address indexed payer, uint256 amount);
    event BillSettled(uint256 indexed billId, uint256 totalAmount);
    event BillCancelled(uint256 indexed billId);

    error MismatchedShares();
    error AlreadySettled();
    error NotAParticipant();
    error AlreadyPaidInFull();
    error WrongAmount();
    error TransferFailed();
    error DuplicateParticipant();
    error ZeroAddressParticipant();
    error ZeroShare();
    error NotOrganizer();
    error BillIsCancelled();

    function createBill(
        string calldata label,
        address[] calldata participants,
        uint256[] calldata shares
    ) external returns (uint256 billId) {
        if (participants.length != shares.length || participants.length == 0) {
            revert MismatchedShares();
        }

        for (uint256 i = 0; i < participants.length; i++) {
            if (participants[i] == address(0)) revert ZeroAddressParticipant();
            if (shares[i] == 0) revert ZeroShare();
            for (uint256 j = i + 1; j < participants.length; j++) {
                if (participants[i] == participants[j]) revert DuplicateParticipant();
            }
        }

        uint256 total;
        for (uint256 i = 0; i < shares.length; i++) {
            total += shares[i];
        }

        billId = billCount++;
        Bill storage b = bills[billId];
        b.organizer = msg.sender;
        b.label = label;
        b.totalAmount = total;
        b.participants = participants;

        for (uint256 i = 0; i < participants.length; i++) {
            shareOwed[billId][participants[i]] = shares[i];
        }

        emit BillCreated(billId, msg.sender, label, total);
    }

    function paySplit(uint256 billId) external payable {
        Bill storage b = bills[billId];
        if (b.settled) revert AlreadySettled();
        if (b.cancelled) revert BillIsCancelled();

        uint256 owed = shareOwed[billId][msg.sender];
        if (owed == 0) revert NotAParticipant();

        uint256 alreadyPaid = amountPaid[billId][msg.sender];
        if (alreadyPaid >= owed) revert AlreadyPaidInFull();
        if (msg.value != owed - alreadyPaid) revert WrongAmount();

        amountPaid[billId][msg.sender] = owed;
        b.paidAmount += msg.value;

        emit SharePaid(billId, msg.sender, msg.value);

        if (b.paidAmount >= b.totalAmount) {
            b.settled = true;
            emit BillSettled(billId, b.totalAmount);
            (bool ok, ) = b.organizer.call{value: b.totalAmount}("");
            if (!ok) revert TransferFailed();
        }
    }

    /// @notice Cancel an unsettled bill and refund everyone who already
    ///         paid their share. Only the organizer can call this, and
    ///         only before the bill is fully settled.
    function cancelBill(uint256 billId) external {
        Bill storage b = bills[billId];
        if (msg.sender != b.organizer) revert NotOrganizer();
        if (b.settled) revert AlreadySettled();
        if (b.cancelled) revert BillIsCancelled();

        b.cancelled = true;
        // NOTE: paidAmount is intentionally left as-is here (not reset to
        // zero). Once cancelled is true, nothing else in the contract
        // reads paidAmount for logic purposes, so it safely doubles as
        // "total amount refunded" for display in the UI.

        for (uint256 i = 0; i < b.participants.length; i++) {
            address participant = b.participants[i];
            uint256 paid = amountPaid[billId][participant];
            if (paid > 0) {
                amountPaid[billId][participant] = 0;
                (bool ok, ) = participant.call{value: paid}("");
                if (!ok) revert TransferFailed();
            }
        }

        emit BillCancelled(billId);
    }

    function getBill(uint256 billId)
        external
        view
        returns (
            address organizer,
            string memory label,
            uint256 totalAmount,
            uint256 paidAmount,
            bool settled,
            bool cancelled,
            address[] memory participants
        )
    {
        Bill storage b = bills[billId];
        return (b.organizer, b.label, b.totalAmount, b.paidAmount, b.settled, b.cancelled, b.participants);
    }

    function hasPaid(uint256 billId, address who) external view returns (bool) {
        return amountPaid[billId][who] >= shareOwed[billId][who];
    }
}
