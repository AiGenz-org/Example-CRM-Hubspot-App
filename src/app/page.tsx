import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  DatabaseZap,
  Layers3,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LeadForm } from "@/components/leads/lead-form";
import { CrmOrbitScene } from "@/components/marketing/crm-orbit-scene";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08111f]/90 text-white backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-teal-400 text-[#08111f]">
              <Layers3 className="size-4" />
            </span>
            CRM Sync
          </Link>
          <Link
            href="/admin"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "gap-1.5 border-white/20 bg-white/10 text-white hover:bg-white/15",
            )}
          >
            Admin
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden bg-[#08111f] text-white">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:44px_44px]" />
          <CrmOrbitScene />
          <div className="relative mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_500px] lg:py-16">
            <div className="flex flex-col justify-center gap-8">
              <div className="max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1 text-sm font-medium text-teal-100">
                  <Sparkles className="size-4 text-teal-300" />
                  Agency growth desk
                </div>
                <h1 className="max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-7xl">
                  CRM Sync Dashboard
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                  Capture qualified inquiries, monitor every local lead, and
                  push contacts, deals, and notes into HubSpot with sync status
                  visible at a glance.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="#lead-form"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 gap-2 bg-teal-300 text-[#08111f] hover:bg-teal-200",
                  )}
                >
                  Capture lead
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15",
                  )}
                >
                  View dashboard
                  <BarChart3 className="size-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: DatabaseZap, label: "Neon/Postgres ready" },
                  { icon: RefreshCcw, label: "Retry-safe sync" },
                  { icon: ShieldCheck, label: "Validated intake" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/10 backdrop-blur"
                  >
                    <item.icon className="mb-3 size-5 text-teal-300" />
                    <p className="text-sm font-medium text-zinc-100">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card
              id="lead-form"
              className="self-center rounded-lg border-white/15 bg-white/95 shadow-2xl shadow-black/30"
            >
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      <BadgeCheck className="size-3.5 text-teal-600" />
                      HubSpot-ready inquiry
                    </div>
                    <h2 className="text-2xl font-semibold text-zinc-950">
                      Start a conversation
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-zinc-600">
                      Tell us where you need momentum. We will route your
                      inquiry into the agency pipeline.
                    </p>
                  </div>
                </div>
                <LeadForm />
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-zinc-200 bg-white px-5 py-8">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              ["Local first", "Lead creation does not depend on CRM uptime."],
              ["CRM aware", "Contact, deal, and sync IDs stay visible."],
              ["Ops friendly", "Failed syncs can be retried from admin."],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-lg border border-zinc-200 p-5">
                <p className="text-sm font-semibold text-zinc-950">{title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
