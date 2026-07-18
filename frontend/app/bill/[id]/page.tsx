"use client";

import Link from "next/link";
import { formatEther } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useReadContract } from "wagmi";
import { splitBillAbi, splitBillAddress } from "@/lib/splitBillAbi";
import { ParticipantRow } from "@/components/ParticipantRow";
import { PayButton } from "@/components/PayButton";
import { CornerMascots } from "@/components/CornerMascots";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { CancelBillButton } from "@/components/CancelBillButton";

export default function BillPage({
  params,
}: {
  params: { id: string };
}) {
  const billId = BigInt(params.id);

  const { data, refetch, isLoading } = useReadContract({
    address: splitBillAddress,
    abi: splitBillAbi,
    functionName: "getBill",
    args: [billId],
  });

  return (
    <>
      <header className="w-full flex items-center justify-between px-6 md:px-10 py-6">
        <Link
          href="/"
          className="text-sm text-onbg/60 hover:text-onbg flex items-center gap-1"
        >
          ← Back to home
        </Link>
        <ConnectButton />
      </header>

      <div className="w-full h-0.5 bg-accent" />

      <main className="max-w-2xl mx-auto px-6 pt-8 pb-12">
        {isLoading && <p className="text-onbg/60">Loading bill...</p>}

        {data && (
          <>
            {(() => {
              const [organizer, label, totalAmount, paidAmount, settled, cancelled, participants] = data as [
                `0x${string}`,
                string,
                bigint,
                bigint,
                boolean,
                boolean,
                readonly `0x${string}`[]
              ];

              return (
                <div className="space-y-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-accent mb-1">
                        Tab #{billId.toString()}
                      </p>
                      <h2 className="font-display text-xl font-bold text-onbg">
                        {label}
                      </h2>
                      <p className="text-sm text-onbg/50 mt-1">
                        Opened by {organizer.slice(0, 6)}...{organizer.slice(-4)}
                      </p>
                    </div>
                    <CopyLinkButton />
                  </div>

                  <div className="receipt-card p-6 pb-8">
                    <div className="flex justify-between text-sm mb-2 ledger-row pb-2">
                      <span className="text-ink/60">Total</span>
                      <span className="figure text-ink">{formatEther(totalAmount)} MON</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4 ledger-row pb-2">
                      <span className="text-ink/60">
                        {cancelled ? "Refunded" : "Paid so far"}
                      </span>
                      <span className="figure text-ink">{formatEther(paidAmount)} MON</span>
                    </div>

                    <div className="pt-2">
                      {cancelled ? (
                        <span className="stamp text-stampRed">Cancelled</span>
                      ) : settled ? (
                        <span className="stamp text-ledger">Settled</span>
                      ) : (
                        <span className="stamp text-aged">Awaiting payment</span>
                      )}
                    </div>
                  </div>

                  {!cancelled && (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-onbg/50 mb-2">
                        Line items
                      </h3>
                      <div className="receipt-card px-6 pb-8">
                        {participants.map((p) => (
                          <ParticipantRow key={p} billId={billId} participant={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {!settled && !cancelled && (
                    <div className="receipt-card p-6 pb-8 space-y-4">
                      <h3 className="text-xs uppercase tracking-widest text-ink/40">
                        Pay your share
                      </h3>
                      <PayButton billId={billId} onPaid={() => refetch()} />
                    </div>
                  )}

                  {!settled && !cancelled && (
                    <CancelBillButton
                      billId={billId}
                      organizer={organizer}
                      onCancelled={() => refetch()}
                    />
                  )}

                  {cancelled && (
                    <p className="text-sm text-onbg/50">
                      This tab was cancelled by the organizer. Anyone who had
                      already paid their share was refunded in full.
                    </p>
                  )}
                </div>
              );
            })()}
          </>
        )}

        <CornerMascots />
      </main>
    </>
  );
}
