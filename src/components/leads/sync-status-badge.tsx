import { SyncStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

const syncStatusClasses: Record<SyncStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  SYNCED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-rose-200 bg-rose-50 text-rose-800",
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  return (
    <Badge variant="outline" className={syncStatusClasses[status]}>
      {status}
    </Badge>
  );
}
