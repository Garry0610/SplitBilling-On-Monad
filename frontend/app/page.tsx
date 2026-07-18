"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CreateBillForm } from "@/components/CreateBillForm";
import { MyBillsList } from "@/components/MyBillsList";
import { CornerMascots } from "@/components/CornerMascots";

export default function HomePage() {
  return (
    <>
      <header className="w-full flex items-center justify-between px-6 md:px-10 py-6">
        <div className="flex items-center gap-3">
          <img src="/monad-logo.png" alt="Monad" className="h-7 w-auto" />
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-onbg">
              SplitBill On Monad
            </h1>
            <p className="text-xs text-accent tracking-wide uppercase mt-0.5 font-medium">
              No. 001 · Monad Testnet Ledger
            </p>
          </div>
        </div>
        <ConnectButton />
      </header>

      {/* Full-bleed rule spanning the entire viewport width. */}
      <div className="w-full h-0.5 bg-accent" />

      <main className="max-w-2xl mx-auto px-6 pt-8 pb-12">
        <p className="text-onbg/70 mb-10 leading-relaxed">
          Split a bill with friends and settle up directly on Monad. Open a
          tab below, share the link, everyone pays their own line item.
        </p>

        <section className="mb-10">
          <h2 className="text-xs uppercase tracking-widest text-onbg/50 mb-3">
            Your open tabs
          </h2>
          <MyBillsList />
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-widest text-onbg/50 mb-3">
            Open a new tab
          </h2>
          <div className="receipt-card p-6 mb-3">
            <CreateBillForm />
          </div>
        </section>

        <CornerMascots />
      </main>
    </>
  );
}
