"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { splitBillAbi, splitBillAddress } from "@/lib/splitBillAbi";
import { getFriendlyErrorMessage } from "@/lib/errors";

export function CancelBillButton({
  billId,
  organizer,
  onCancelled,
}: {
  billId: bigint;
  organizer: `0x${string}`;
  onCancelled: () => void;
}) {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only the organizer sees this at all.
  if (!address || address.toLowerCase() !== organizer.toLowerCase()) {
    return null;
  }

  async function handleCancel() {
    setError(null);
    try {
      setCancelling(true);
      const txHash = await writeContractAsync({
        address: splitBillAddress,
        abi: splitBillAbi,
        functionName: "cancelBill",
        args: [billId],
      });
      await publicClient!.waitForTransactionReceipt({ hash: txHash });
      await queryClient.invalidateQueries();
      onCancelled();
    } catch (err) {
      console.error(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setCancelling(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => setConfirming(true)}
          className="text-xs text-onbg/40 hover:text-stampRed underline decoration-dotted"
        >
          Cancel this tab
        </button>
        {error && (
          <div className="rounded-sm border border-stampRed/30 bg-stampRed/10 px-3 py-2">
            <p className="text-sm text-stampRed">{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stampRed/30 bg-stampRed/10 p-3 space-y-2">
      <p className="text-sm text-stampRed">
        This refunds anyone who&apos;s already paid and closes the tab for
        good. This can&apos;t be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="rounded-sm bg-stampRed hover:bg-stampRed/90 disabled:opacity-50 px-3 py-1.5 text-xs font-medium text-white"
        >
          {cancelling ? "Cancelling..." : "Yes, cancel and refund"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={cancelling}
          className="rounded-sm border border-line px-3 py-1.5 text-xs text-onbg/60 hover:text-onbg"
        >
          Never mind
        </button>
      </div>
    </div>
  );
}
