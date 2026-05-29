import Link from "next/link";
import { LeadStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { leadStatusValues } from "@/lib/validations/lead";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getStatusFilter(searchParams: { status?: string }) {
  const status = searchParams.status;
  return leadStatusValues.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : undefined;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = getStatusFilter(params);
  const [leads, totals] = await Promise.all([
    prisma.lead.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.groupBy({
      by: ["syncStatus"],
      _count: true,
    }),
  ]);

  const totalLeads = leads.length;
  const syncCounts = Object.fromEntries(
    totals.map((item) => [item.syncStatus, item._count]),
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-teal-700">
              Admin dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Lead operations</h1>
          </div>
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Public form
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-600">Visible leads</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{totalLeads}</CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-600">Synced</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-emerald-700">
              {syncCounts.SYNCED ?? 0}
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-600">Pending</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-amber-700">
              {syncCounts.PENDING ?? 0}
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm text-zinc-600">Failed</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-rose-700">
              {syncCounts.FAILED ?? 0}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin"
            className={buttonVariants({
              variant: !statusFilter ? "default" : "outline",
              size: "sm",
            })}
          >
            All
          </Link>
          {leadStatusValues.map((status) => (
            <Link
              href={`/admin?status=${status}`}
              key={status}
              className={buttonVariants({
                variant: statusFilter === status ? "default" : "outline",
                size: "sm",
              })}
            >
              {status}
            </Link>
          ))}
        </div>

        <Card className="overflow-hidden rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>CRM sync</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.length ? (
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium hover:underline"
                      >
                        {lead.name}
                      </Link>
                      <div className="text-sm text-zinc-500">{lead.email}</div>
                    </TableCell>
                    <TableCell>{lead.serviceInterested}</TableCell>
                    <TableCell>
                      <StatusSelect leadId={lead.id} status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <SyncStatusBadge status={lead.syncStatus} />
                        {lead.syncStatus === "FAILED" ? (
                          <RetrySyncButton leadId={lead.id} />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{lead.createdAt.toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "ml-auto",
                        )}
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                    No leads match this view yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </main>
  );
}
