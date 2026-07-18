"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseEther, formatEther, decodeEventLog, isAddress, type Address } from "viem";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { splitBillAbi, splitBillAddress } from "@/lib/splitBillAbi";
import { setNickname } from "@/lib/addressBook";
import { getFriendlyErrorMessage } from "@/lib/errors";

type ParticipantRow = {
  address: string;
  amount: string;
  nickname: string;
};

const inputClass =
  "rounded-sm bg-paper border border-line px-3 py-2 text-ink text-sm placeholder:text-ink/30 focus:outline-none focus:border-accent";

export function CreateBillForm() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [label, setLabel] = useState("");
  const [equalTotal, setEqualTotal] = useState("");
  const [rows, setRows] = useState<ParticipantRow[]>([
    { address: "", amount: "", nickname: "" },
    { address: "", amount: "", nickname: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateRow(index: number, field: keyof ParticipantRow, value: string) {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addRow() {
    setRows((prev) => [...prev, { address: "", amount: "", nickname: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function splitEqually() {
    setError(null);
    const filledIndexes = rows
      .map((row, i) => (row.address.trim() ? i : -1))
      .filter((i) => i !== -1);

    if (filledIndexes.length === 0) {
      setError("Fill in participant addresses first, then split equally.");
      return;
    }
    if (!equalTotal.trim()) {
      setError("Enter a total amount to split equally.");
      return;
    }

    let totalWei: bigint;
    try {
      totalWei = parseEther(equalTotal.trim());
    } catch {
      setError("Total amount isn't a valid number.");
      return;
    }

    const n = BigInt(filledIndexes.length);
    const shareWei = totalWei / n;
    const remainder = totalWei - shareWei * n;

    setRows((prev) =>
      prev.map((row, i) => {
        const pos = filledIndexes.indexOf(i);
        if (pos === -1) return row;
        const isLast = pos === filledIndexes.length - 1;
        const wei = isLast ? shareWei + remainder : shareWei;
        return { ...row, amount: formatEther(wei) };
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!label.trim()) {
      setError("Give the tab a name.");
      return;
    }
    const validRows = rows.filter((r) => r.address.trim() && r.amount.trim());
    if (validRows.length === 0) {
      setError("Add at least one participant with an amount.");
      return;
    }

    const badAddress = validRows.find((r) => !isAddress(r.address.trim()));
    if (badAddress) {
      setError(`"${badAddress.address}" isn't a valid wallet address.`);
      return;
    }

    const addressesLower = validRows.map((r) => r.address.trim().toLowerCase());
    const hasDuplicate = new Set(addressesLower).size !== addressesLower.length;
    if (hasDuplicate) {
      setError("The same address appears more than once.");
      return;
    }

    try {
      setSubmitting(true);

      const participants = validRows.map((r) => r.address.trim() as Address);
      const shares = validRows.map((r) => parseEther(r.amount.trim()));

      validRows.forEach((r) => {
        setNickname(r.address.trim(), r.nickname);
      });

      const txHash = await writeContractAsync({
        address: splitBillAddress,
        abi: splitBillAbi,
        functionName: "createBill",
        args: [label.trim(), participants, shares],
      });

      const receipt = await publicClient!.waitForTransactionReceipt({
        hash: txHash,
      });

      let billId: bigint | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: splitBillAbi,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "BillCreated") {
            billId = (decoded.args as { billId: bigint }).billId;
            break;
          }
        } catch {
          // not our event, skip
        }
      }

      if (billId === null) {
        throw new Error("Could not find the new bill id in the transaction logs.");
      }

      router.push(`/bill/${billId.toString()}`);
    } catch (err) {
      console.error(err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
      <div>
        <label className="block text-xs uppercase tracking-widest text-ink/40 mb-1.5">
          Tab name
        </label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Friday dinner"
          autoComplete="off"
          className={`w-full ${inputClass}`}
        />
      </div>

      <div className="ledger-row pb-4 flex gap-2 items-end">
        <div className="flex-1">
          <label className="block text-xs uppercase tracking-widest text-ink/40 mb-1.5">
            Split this total equally (MON)
          </label>
          <input
            value={equalTotal}
            onChange={(e) => setEqualTotal(e.target.value)}
            placeholder="e.g. 2"
            autoComplete="off"
            className={`w-full ${inputClass}`}
          />
        </div>
        <button
          type="button"
          onClick={splitEqually}
          className="rounded-sm border border-accent/40 hover:border-accent px-3 py-2 text-sm text-accent whitespace-nowrap"
        >
          Split equally
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-widest text-ink/40">
          Participants
        </label>
        {rows.map((row, i) => {
          const trimmed = row.address.trim();
          const invalid = trimmed.length > 0 && !isAddress(trimmed);
          return (
            <div key={i}>
              <div className="flex gap-2">
                <input
                  value={row.nickname}
                  onChange={(e) => updateRow(i, "nickname", e.target.value)}
                  placeholder="Nickname"
                  autoComplete="off"
                  name={`nickname-${i}`}
                  className={`w-28 ${inputClass}`}
                />
                <input
                  value={row.address}
                  onChange={(e) => updateRow(i, "address", e.target.value)}
                  placeholder="0x... wallet address"
                  autoComplete="off"
                  name={`address-${i}`}
                  className={`flex-1 figure ${inputClass} ${
                    invalid ? "border-stampRed" : ""
                  }`}
                />
                <input
                  value={row.amount}
                  onChange={(e) => updateRow(i, "amount", e.target.value)}
                  placeholder="Amount"
                  autoComplete="off"
                  name={`amount-${i}`}
                  className={`w-28 figure ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="px-2 text-ink/30 hover:text-stampRed"
                  aria-label="Remove participant"
                >
                  ✕
                </button>
              </div>
              {invalid && (
                <p className="text-xs text-stampRed mt-1">
                  Not a valid wallet address.
                </p>
              )}
            </div>
          );
        })}
        <button
          type="button"
          onClick={addRow}
          className="text-sm text-accent hover:underline"
        >
          + Add participant
        </button>
      </div>

      {error && (
        <div className="rounded-sm border border-stampRed/30 bg-stampRed/10 px-3 py-2">
          <p className="text-sm text-stampRed">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isConnected || submitting}
        className="w-full rounded-sm bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 font-medium text-white"
      >
        {!isConnected
          ? "Connect wallet to open a tab"
          : submitting
          ? "Opening tab on-chain..."
          : "Open tab"}
      </button>
    </form>
  );
}
