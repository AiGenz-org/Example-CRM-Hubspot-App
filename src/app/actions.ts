"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  leadFormSchema,
  retryLeadSyncSchema,
  updateLeadStatusSchema,
} from "@/lib/validations/lead";
import { syncLeadToHubSpot } from "@/services/hubspot";

export type LeadFormState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export async function createLeadAction(
  _previousState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = leadFormSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const lead = await prisma.lead.create({
    data: {
      ...parsed.data,
      status: "NEW",
      syncStatus: "PENDING",
    },
  });

  syncLeadToHubSpot(lead.id).catch((error) => {
    console.error("HubSpot sync failed after lead creation", error);
  });

  revalidatePath("/admin");

  return {
    ok: true,
    message:
      "Thanks. Your inquiry is in our pipeline and our team will follow up shortly.",
  };
}

export async function retryLeadSyncAction(formData: FormData) {
  const parsed = retryLeadSyncSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error("Invalid lead id.");
  }

  await syncLeadToHubSpot(parsed.data.leadId);
  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
}

export async function updateLeadStatusAction(formData: FormData) {
  const parsed = updateLeadStatusSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    throw new Error("Invalid lead status update.");
  }

  await prisma.lead.update({
    where: { id: parsed.data.leadId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/leads/${parsed.data.leadId}`);
}
