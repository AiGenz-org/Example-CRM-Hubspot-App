import Link from "next/link";
import type { ComponentType } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeDollarSign, Building2, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { RetrySyncButton } from "@/components/leads/retry-sync-button";
import { StatusSelect } from "@/components/leads/status-select";
import { SyncStatusBadge } from "@/components/leads/sync-status-badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-zinc-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2 bg-white")}
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          {lead.syncStatus === "FAILED" ? <RetrySyncButton leadId={lead.id} /> : null}
        </div>

        <Card className="overflow-hidden rounded-lg border-zinc-200 bg-white shadow-xl shadow-zinc-950/5">
          <CardHeader className="border-b border-zinc-200 bg-[#08111f] text-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-teal-200">
                  Lead profile
                </p>
                <CardTitle className="text-4xl">{lead.name}</CardTitle>
                <p className="mt-2 text-zinc-300">{lead.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LeadStatusBadge status={lead.status} />
                <SyncStatusBadge status={lead.syncStatus} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Detail icon={Phone} label="Phone" value={lead.phone} />
              <Detail icon={Building2} label="Company" value={lead.company} />
              <Detail icon={Mail} label="Service" value={lead.serviceInterested} />
              <Detail icon={BadgeDollarSign} label="Budget" value={lead.budget} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <h2 className="font-semibold">Pipeline status</h2>
              <StatusSelect leadId={lead.id} status={lead.status} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <h2 className="font-semibold">Message</h2>
              <p className="whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 p-4 leading-7 text-zinc-700">
                {lead.message}
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="HubSpot contact ID" value={lead.hubspotContactId} />
              <Detail label="HubSpot deal ID" value={lead.hubspotDealId} />
              <Detail
                label="Last synced"
                value={lead.lastSyncedAt?.toLocaleString()}
              />
              <Detail label="Created" value={lead.createdAt.toLocaleString()} />
            </div>

            {lead.syncError ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
                <p className="font-medium">Sync error</p>
                <p className="mt-2 break-words">{lead.syncError}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon?: ComponentType<{ className?: string }>;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="size-4 text-teal-600" /> : null}
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          {label}
        </p>
      </div>
      <p className="mt-3 font-medium text-zinc-900">{value || "Not provided"}</p>
    </div>
  );
}
