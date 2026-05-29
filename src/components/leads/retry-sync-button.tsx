"use client";

import { useTransition } from "react";
import { RefreshCcw } from "lucide-react";
import { retryLeadSyncAction } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function RetrySyncButton({ leadId }: { leadId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await retryLeadSyncAction(formData);
        });
      }}
    >
      <input type="hidden" name="leadId" value={leadId} />
      <Button size="sm" variant="outline" disabled={isPending}>
        <RefreshCcw className="size-4" />
        {isPending ? "Retrying" : "Retry sync"}
      </Button>
    </form>
  );
}
