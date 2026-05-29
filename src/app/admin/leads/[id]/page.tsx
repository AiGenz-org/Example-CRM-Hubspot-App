import Link from "next/link";
import { notFound } from "next/navigation";
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
    <main className="min-h-screen bg-zinc-50 px-5 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/admin" className={buttonVariants({ variant: "outline" })}>
            Back to dashboard
          </Link>
          {lead.syncStatus === "FAILED" ? <RetrySyncButton leadId={lead.id} /> : null}
        </div>

        <Card className="rounded-lg">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-3xl">{lead.name}</CardTitle>
                <p className="mt-2 text-zinc-600">{lead.email}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LeadStatusBadge status={lead.status} />
                <SyncStatusBadge status={lead.syncStatus} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Phone" value={lead.phone} />
              <Detail label="Company" value={lead.company} />
              <Detail label="Service" value={lead.serviceInterested} />
              <Detail label="Budget" value={lead.budget} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <h2 className="font-semibold">Pipeline status</h2>
              <StatusSelect leadId={lead.id} status={lead.status} />
            </div>

            <Separator />

            <div className="grid gap-2">
              <h2 className="font-semibold">Message</h2>
              <p className="whitespace-pre-wrap rounded-lg border bg-white p-4 leading-7 text-zinc-700">
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
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-medium text-zinc-900">{value || "Not provided"}</p>
    </div>
  );
}
