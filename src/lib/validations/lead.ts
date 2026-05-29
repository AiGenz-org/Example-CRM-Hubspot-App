import { z } from "zod";

export const leadStatusValues = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "WON",
  "LOST",
] as const;

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined));

const phoneSchema = optionalText.refine(
  (value) => !value || /^[+()\d\s.-]{7,20}$/.test(value),
  "Enter a valid phone number.",
);

const budgetSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[$,\s]/g, ""))
  .refine(
    (value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value),
    "Enter a single numeric budget amount, for example 5000 or $5,000.",
  )
  .transform((value) => (value.length ? value : undefined));

export const leadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: phoneSchema,
  company: optionalText,
  serviceInterested: z
    .string()
    .trim()
    .min(2, "Choose or enter the service you are interested in."),
  budget: budgetSchema,
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
});

export const updateLeadStatusSchema = z.object({
  leadId: z.string().cuid(),
  status: z.enum(leadStatusValues),
});

export const retryLeadSyncSchema = z.object({
  leadId: z.string().cuid(),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;
