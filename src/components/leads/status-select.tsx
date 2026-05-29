"use client";

import { useState, useTransition } from "react";
import { LeadStatus } from "@/generated/prisma/client";
import { updateLeadStatusAction } from "@/app/actions";
import { leadStatusValues } from "@/lib/validations/lead";

export function StatusSelect({
  leadId,
  status,
}: {
  leadId: string;
  status: LeadStatus;
}) {
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="grid gap-1">
      <select
        value={currentStatus}
        disabled={isPending}
        className="border-input bg-background focus-visible:ring-ring h-9 w-[160px] rounded-lg border px-3 text-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={(event) => {
          const nextStatus = event.target.value as LeadStatus;
          const previousStatus = currentStatus;

          setCurrentStatus(nextStatus);
          setError(null);

          const formData = new FormData();
          formData.set("leadId", leadId);
          formData.set("status", nextStatus);

          startTransition(async () => {
            try {
              await updateLeadStatusAction(formData);
            } catch {
              setCurrentStatus(previousStatus);
              setError("Could not update status.");
            }
          });
        }}
      >
        {leadStatusValues.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
