"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { splitBillAbi, splitBillAddress } from "@/lib/splitBillAbi";

type BillTuple = readonly [
  `0x${string}`, // organizer
  string,        // label
  bigint,        // totalAmount
  bigint,        // paidAmount
  boolean,       // settled
  boolean,       // cancelled
  readonly `0x${string}`[] // participants
];

export function MyBillsList() {
  const { address, isConnected } = useAccount();

  const { data: billCount } = useReadContract({
    address: splitBillAddress,
    abi: splitBillAbi,
    functionName: "billCount",
  });

  const count = billCount !== undefined ? Number(billCount) : 0;

  const { data: bills, isLoading } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: splitBillAddress,
      abi: splitBillAbi,
      functionName: "getBill",
      args: [BigInt(i)],
    })),
    query: { enabled: count > 0 },
  });

  if (!isConnected) {
    return (
      <p className="text-sm text-onbg/50">
        Connect your wallet to see the tabs you&apos;re part of.
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-onbg/50">Loading your tabs...</p>;
  }

  if (!bills || bills.length === 0) {
    return (
      <p className="text-sm text-onbg/50">
        No tabs yet. Open one below to get started.
      </p>
    );
  }

  const myBills = bills
    .map((result, id) => {
      if (result.status !== "success") return null;
      // wagmi/viem infers a differently-shaped type here because the ABI's
      // outputs are named; it doesn't structurally match our BillTuple, so
      // we go through `unknown` first (as TS suggests) since we know the
      // actual runtime value is array-like and destructures correctly.
      const bill = result.result as unknown as BillTuple;
      const [organizer, label, totalAmount, paidAmount, settled, cancelled, participants] = bill;

      const isOrganizer = address ? organizer.toLowerCase() === address.toLowerCase() : false;
      const isParticipant = address
        ? participants.some((p) => p.toLowerCase() === address.toLowerCase())
        : false;

      if (!isOrganizer && !isParticipant) return null;

      return {
        id,
        label,
        totalAmount,
        paidAmount,
        settled,
        cancelled,
        role: isOrganizer ? "Organizer" : "Participant",
      };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null)
    .reverse();

  if (myBills.length === 0) {
    return (
      <p className="text-sm text-onbg/50">
        No tabs involving this wallet yet. Open one below.
      </p>
    );
  }

  return (
    <div className="receipt-card pb-8">
      {myBills.map((bill) => (
        <Link
          key={bill.id}
          href={`/bill/${bill.id}`}
          className="flex items-center justify-between px-6 py-3 ledger-row hover:bg-white/[0.02] transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-ink">{bill.label}</p>
            <p className="text-xs text-ink/40 uppercase tracking-wide">{bill.role}</p>
          </div>
          <div className="text-right">
            <p className="text-sm figure text-ink/70">
              {formatEther(bill.paidAmount)} / {formatEther(bill.totalAmount)} MON
            </p>
            <p
              className={`text-xs font-medium ${
                bill.cancelled
                  ? "text-stampRed"
                  : bill.settled
                  ? "text-ledger"
                  : "text-aged"
              }`}
            >
              {bill.cancelled ? "Cancelled" : bill.settled ? "Settled ✓" : "Awaiting payment"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
