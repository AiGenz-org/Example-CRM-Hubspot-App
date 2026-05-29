"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-zinc-950">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center">
        <div className="w-full rounded-lg border border-rose-200 bg-white p-6 shadow-xl shadow-zinc-950/5">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold">Admin dashboard could not load</h1>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            The admin page needs a working database connection. Check that
            `DATABASE_URL` is set in the Vercel Production environment and that
            the Neon database has the Prisma migration applied.
          </p>
          {error.digest ? (
            <p className="mt-4 rounded-md bg-zinc-100 px-3 py-2 text-xs text-zinc-600">
              Digest: {error.digest}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className={buttonVariants()} onClick={reset}>
              Try again
            </button>
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Public form
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
