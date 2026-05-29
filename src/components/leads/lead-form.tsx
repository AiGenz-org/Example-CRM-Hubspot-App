"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { createLeadAction, LeadFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: LeadFormState = {
  ok: false,
  message: "",
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="text-sm text-rose-600">{errors[0]}</p>;
}

export function LeadForm() {
  const [state, formAction, isPending] = useActionState(
    createLeadAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state.message ? (
        <div
          className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {state.ok ? <CheckCircle2 className="mt-0.5 size-4" /> : null}
          <span>{state.message}</span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Avery Stone"
            className="h-10 bg-white"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="avery@example.com"
            className="h-10 bg-white"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+1 415 555 0148"
            className="h-10 bg-white"
          />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            placeholder="Northstar Studio"
            className="h-10 bg-white"
          />
          <FieldError errors={state.fieldErrors?.company} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="serviceInterested">Service interested in</Label>
          <select
            id="serviceInterested"
            name="serviceInterested"
            defaultValue=""
            className="border-input bg-white ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <option value="" disabled>
              Select a service
            </option>
            <option value="Website redesign">Website redesign</option>
            <option value="CRM implementation">CRM implementation</option>
            <option value="Paid acquisition">Paid acquisition</option>
            <option value="Brand strategy">Brand strategy</option>
            <option value="Analytics setup">Analytics setup</option>
          </select>
          <FieldError errors={state.fieldErrors?.serviceInterested} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget</Label>
          <Input
            id="budget"
            name="budget"
            inputMode="decimal"
            placeholder="$5,000"
            className="h-10 bg-white"
          />
          <FieldError errors={state.fieldErrors?.budget} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Tell us what you are trying to improve, launch, or automate."
          className="bg-white"
        />
        <FieldError errors={state.fieldErrors?.message} />
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isPending}
        className="h-11 w-full bg-[#08111f] text-white hover:bg-[#12223a] sm:w-fit"
      >
        {isPending ? "Sending" : "Send inquiry"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
