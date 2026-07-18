"use client";

import { useState } from "react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs uppercase tracking-wide rounded-sm border border-accent/40 hover:border-accent px-3 py-1.5 text-onbg/70 hover:text-onbg transition-colors whitespace-nowrap"
    >
      {copied ? "Copied ✓" : "Copy link"}
    </button>
  );
}
