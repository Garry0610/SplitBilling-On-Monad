"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { splitBillAbi, splitBillAddress } from "@/lib/splitBillAbi";
import { getFriendlyErrorMessage } from "@/lib/errors";

export function PayButton({
  billId,
  onPaid,
}: {
  billId: bigint;
  onPaid: () => void;
}) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: owed } = useReadContract({
    address: splitBillAddress,
    abi: splitBillAbi,
    functionName: "shareOwed",
    args: address ? [billId, address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { data: paid } = useReadContract({
    address: splitBillAddress,
    abi: splitBillAbi,
    functionName: "amountPaid",
    args: address ? [billId, address] : undefined,
    query: { enabled: Boolean(address) },
  });

  if (!isConnected) {
    return <p className="text-sm text-ink/50">Connect your wallet to pay.</p>;
  }

  if (owed === undefined || owed === 0n) {
    return (
      <p className="text-sm text-ink/50">
        This wallet isn&apos;t a participant on this bill.
      </p>
    );
  }

  const remaining = owed - (paid ?? 0n);

  if (remaining <= 0n) {
    return <p className="text-sm text-ledger font-medium">You&apos;ve paid your share ✓</p>;
  }

  async function handlePay() {
    setError(null);
    try {
      setPaying(true);
      const txHash = await writeContractAsync({
        address: splitBillAddress,
        abi: splitBillAbi,
        functionName: "paySplit",
        args: [billId],
        value: remaining,
      });
      await publicClient!.waitForTransactionReceipt({ hash: txHash });
      await queryClient.invalidateQueries();
      onPaid();
    } catch (err) {
      console.error(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePay}
        disabled={paying}
        className="rounded-sm bg-accent hover:bg-accent/90 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white"
      >
        {paying ? "Paying..." : `Pay ${formatEther(remaining)} MON`}
      </button>
      {error && (
        <div className="rounded-sm border border-stampRed/30 bg-stampRed/10 px-3 py-2">
          <p className="text-sm text-stampRed">{error}</p>
        </div>
      )}
    </div>
  );
}
