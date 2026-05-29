import Link from "next/link";
import {
  ArrowUpRight,
  BadgeAlert,
  CheckCircle2,
  Clock3,
  Layers3,
  UsersRound,
} from "lucide-react";
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
export const runtime = "nodejs";

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
    <main className="min-h-screen bg-[#f5f7fb] px-5 py-8 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-[#08111f] text-white shadow-xl shadow-zinc-950/10">
          <div className="bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:36px_36px] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-300/25 bg-teal-300/10 px-3 py-1 text-sm font-medium text-teal-100">
                  <Layers3 className="size-4 text-teal-300" />
                  Admin dashboard
                </div>
                <h1 className="text-4xl font-semibold">Lead operations</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
                  Monitor local pipeline movement, HubSpot sync health, and
                  retry failed CRM activity from one focused workspace.
                </p>
              </div>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "gap-2 border-white/20 bg-white/10 text-white hover:bg-white/15",
                )}
              >
                Public form
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-lg border-zinc-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-zinc-600">Visible leads</CardTitle>
              <UsersRound className="size-5 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{totalLeads}</p>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-zinc-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-zinc-600">Synced</CardTitle>
              <CheckCircle2 className="size-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-emerald-700">
              {syncCounts.SYNCED ?? 0}
            </CardContent>
          </Card>
          <Card className="rounded-lg border-zinc-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-zinc-600">Pending</CardTitle>
              <Clock3 className="size-5 text-amber-500" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-amber-700">
              {syncCounts.PENDING ?? 0}
            </CardContent>
          </Card>
          <Card className="rounded-lg border-zinc-200 bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm text-zinc-600">Failed</CardTitle>
              <BadgeAlert className="size-5 text-rose-500" />
            </CardHeader>
            <CardContent className="text-3xl font-semibold text-rose-700">
              {syncCounts.FAILED ?? 0}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-200 bg-white p-2 shadow-sm">
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

        <Card className="overflow-hidden rounded-lg border-zinc-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50/80">
                <TableHead className="h-12">Lead</TableHead>
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
                  <TableRow key={lead.id} className="hover:bg-teal-50/40">
                    <TableCell>
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-semibold text-zinc-950 hover:text-teal-700"
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
                          "ml-auto text-zinc-700 hover:text-zinc-950",
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
