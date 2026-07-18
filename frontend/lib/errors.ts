// Translates raw viem/wallet/contract errors into short, plain-language
// messages. Viem errors carry a `.shortMessage` that's already much
// cleaner than `.message` (which includes the full request args, ABI,
// docs link, etc.) — we start from that, then map a few common cases to
// something even more specific and friendly.

export function getFriendlyErrorMessage(err: unknown): string {
  const anyErr = err as { shortMessage?: string; message?: string } | null;
  const raw = anyErr?.shortMessage || anyErr?.message || "";

  if (/user rejected/i.test(raw)) {
    return "Cancelled — you closed the wallet prompt without confirming.";
  }
  if (/insufficient funds/i.test(raw)) {
    return "This wallet doesn't have enough MON to cover the amount plus gas. Grab some from the Monad faucet.";
  }
  if (/DuplicateParticipant/.test(raw)) {
    return "The same wallet address appears more than once in this bill.";
  }
  if (/ZeroAddressParticipant/.test(raw)) {
    return "One of the participant addresses is empty or invalid.";
  }
  if (/ZeroShare/.test(raw)) {
    return "Every participant needs an amount greater than zero.";
  }
  if (/MismatchedShares/.test(raw)) {
    return "Something's off with the participant list — check the addresses and amounts.";
  }
  if (/NotAParticipant/.test(raw)) {
    return "This wallet isn't listed as a participant on this bill.";
  }
  if (/AlreadySettled/.test(raw)) {
    return "This bill is already settled — no more payments needed.";
  }
  if (/AlreadyPaidInFull/.test(raw)) {
    return "This wallet has already paid its full share.";
  }
  if (/WrongAmount/.test(raw)) {
    return "That payment amount doesn't match what's owed.";
  }
  if (/TransferFailed/.test(raw)) {
    return "The payout to the organizer failed. Try again, or reach out to them directly.";
  }

  // Fall back to viem's own shortMessage, which is already reasonably
  // clean, before resorting to a generic message.
  if (anyErr?.shortMessage) return anyErr.shortMessage;
  if (err instanceof Error && err.message) return err.message;

  return "Something went wrong. Please try again.";
}
