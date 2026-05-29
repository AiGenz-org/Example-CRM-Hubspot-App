import { LeadStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const leadStatusClasses: Record<LeadStatus, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-800",
  CONTACTED: "border-indigo-200 bg-indigo-50 text-indigo-800",
  QUALIFIED: "border-cyan-200 bg-cyan-50 text-cyan-800",
  WON: "border-emerald-200 bg-emerald-50 text-emerald-800",
  LOST: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant="outline" className={leadStatusClasses[status]}>
      {status}
    </Badge>
  );
}
