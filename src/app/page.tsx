import Link from "next/link";
import { ArrowUpRight, BarChart3, DatabaseZap, ShieldCheck } from "lucide-react";
import { LeadForm } from "@/components/leads/lead-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-lg font-semibold">
            CRM Sync Dashboard
          </Link>
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
          >
            Admin
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1fr_520px] lg:py-16">
          <div className="flex flex-col justify-center gap-8">
            <div className="max-w-3xl">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.16em] text-teal-700">
                Agency growth desk
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-zinc-950 sm:text-6xl">
                CRM Sync Dashboard
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
                Capture qualified inquiries, keep a local lead pipeline, and
                sync contacts and deals into HubSpot without making your public
                form depend on CRM uptime.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: DatabaseZap,
                  label: "PostgreSQL lead store",
                },
                {
                  icon: BarChart3,
                  label: "Admin pipeline visibility",
                },
                {
                  icon: ShieldCheck,
                  label: "Retry-ready CRM sync",
                },
              ].map((item) => (
                <Card key={item.label} className="rounded-lg border-zinc-200">
                  <CardContent className="flex items-center gap-3 p-4">
                    <item.icon className="size-5 text-teal-700" />
                    <span className="text-sm font-medium text-zinc-800">
                      {item.label}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="rounded-lg border-zinc-200 shadow-sm">
            <CardContent className="p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Start a conversation</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  Tell us where you need momentum. We will route your inquiry
                  into our CRM pipeline.
                </p>
              </div>
              <LeadForm />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
