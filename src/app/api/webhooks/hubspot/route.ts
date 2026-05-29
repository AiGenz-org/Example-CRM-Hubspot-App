import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type HubspotWebhookEvent = {
  eventId?: number;
  subscriptionType?: string;
  objectId?: number;
  propertyName?: string;
  propertyValue?: string;
  changeSource?: string;
  eventType?: string;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hubspot-signature-v3");

  // TODO: Verify HubSpot's v3 signature with the app secret before trusting
  // this payload. Keep rawBody available for the HMAC verification step.
  if (!signature) {
    console.warn("HubSpot webhook received without signature header.");
  }

  let events: HubspotWebhookEvent[];

  try {
    const parsed = JSON.parse(rawBody);
    events = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  await prisma.$transaction(
    events.map((event) =>
      prisma.hubspotWebhookEvent.create({
        data: {
          eventId: event.eventId ? String(event.eventId) : null,
          eventType: event.eventType ?? null,
          objectId: event.objectId ? String(event.objectId) : null,
          subscriptionType: event.subscriptionType ?? null,
          payload: event,
        },
      }),
    ),
  );

  for (const event of events) {
    if (!event.objectId) {
      continue;
    }

    const hubspotId = String(event.objectId);

    if (event.subscriptionType?.startsWith("deal.")) {
      await prisma.lead.updateMany({
        where: { hubspotDealId: hubspotId },
        data:
          event.propertyName === "dealstage" && event.propertyValue
            ? { syncStatus: "SYNCED", syncError: null }
            : { syncStatus: "SYNCED", syncError: null },
      });
    }

    if (event.subscriptionType?.startsWith("contact.")) {
      await prisma.lead.updateMany({
        where: { hubspotContactId: hubspotId },
        data: { syncStatus: "SYNCED", syncError: null },
      });
    }
  }

  return NextResponse.json({ received: events.length });
}
