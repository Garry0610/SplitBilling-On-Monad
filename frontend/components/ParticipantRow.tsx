"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { splitBillAbi, splitBillAddress } from "@/lib/splitBillAbi";
import { getNickname } from "@/lib/addressBook";

export function ParticipantRow({
  billId,
  participant,
}: {
  billId: bigint;
  participant: `0x${string}`;
}) {
  const [nickname, setNicknameState] = useState<string | null>(null);

  useEffect(() => {
    setNicknameState(getNickname(participant));
  }, [participant]);

  const { data: owed } = useReadContract({
    address: splitBillAddress,
    abi: splitBillAbi,
    functionName: "shareOwed",
    args: [billId, participant],
  });

  const { data: hasPaid } = useReadContract({
    address: splitBillAddress,
    abi: splitBillAbi,
    functionName: "hasPaid",
    args: [billId, participant],
  });

  const shortAddress = `${participant.slice(0, 6)}...${participant.slice(-4)}`;

  return (
    <div className="flex items-center justify-between ledger-row py-3 text-sm">
      <span className="text-ink/80">
        {nickname ? (
          <>
            <span className="font-medium text-ink">{nickname}</span>{" "}
            <span className="figure text-xs text-ink/40">({shortAddress})</span>
          </>
        ) : (
          <span className="figure text-ink/70">{shortAddress}</span>
        )}
      </span>
      <span className="flex items-center gap-3">
        <span className="figure text-ink/70">
          {owed !== undefined ? `${formatEther(owed)} MON` : "..."}
        </span>
        <span className={owed !== undefined && hasPaid ? "text-ledger font-medium" : "text-aged font-medium"}>
          {hasPaid ? "Paid ✓" : "Unpaid"}
        </span>
      </span>
    </div>
  );
}
