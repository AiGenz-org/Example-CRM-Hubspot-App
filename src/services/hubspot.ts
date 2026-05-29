import { Lead } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type HubspotObjectResponse = {
  id: string;
  properties?: Record<string, string | null>;
};

type HubspotSearchResponse = {
  total: number;
  results: HubspotObjectResponse[];
};

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

function getHubspotToken() {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!token) {
    throw new Error("HUBSPOT_ACCESS_TOKEN is not configured.");
  }

  return token;
}

async function hubspotRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${HUBSPOT_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getHubspotToken()}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`HubSpot ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

async function findContactByEmail(email: string) {
  const response = await hubspotRequest<HubspotSearchResponse>(
    "/crm/v3/objects/contacts/search",
    {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        properties: ["email", "firstname", "lastname", "company", "phone"],
        limit: 1,
      }),
    },
  );

  return response.results[0] ?? null;
}

function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);

  return {
    firstname: firstName,
    lastname: rest.join(" "),
  };
}

function getHubspotAmount(value: string | null) {
  if (!value) {
    return null;
  }

  const amount = value.trim().replace(/[$,\s]/g, "");

  return /^\d+(\.\d{1,2})?$/.test(amount) ? amount : null;
}

export async function upsertHubspotContact(lead: Lead) {
  const existingContact = await findContactByEmail(lead.email);
  const name = splitName(lead.name);
  const properties = {
    email: lead.email,
    firstname: name.firstname,
    lastname: name.lastname,
    phone: lead.phone ?? "",
    company: lead.company ?? "",
  };

  if (existingContact) {
    return hubspotRequest<HubspotObjectResponse>(
      `/crm/v3/objects/contacts/${existingContact.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ properties }),
      },
    );
  }

  return hubspotRequest<HubspotObjectResponse>("/crm/v3/objects/contacts", {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

export async function createHubspotDeal(lead: Lead, contactId: string) {
  const pipeline = process.env.HUBSPOT_PIPELINE_ID ?? "default";
  const dealstage = process.env.HUBSPOT_DEALSTAGE_ID ?? "appointmentscheduled";
  const amount = getHubspotAmount(lead.budget);
  const properties: Record<string, string> = {
    dealname: `${lead.company || lead.name} - ${lead.serviceInterested}`,
    pipeline,
    dealstage,
    description: lead.message,
  };

  if (amount) {
    properties.amount = amount;
  }

  const deal = await hubspotRequest<HubspotObjectResponse>(
    "/crm/v3/objects/deals",
    {
      method: "POST",
      body: JSON.stringify({
        properties,
      }),
    },
  );

  await hubspotRequest(
    `/crm/v3/objects/deals/${deal.id}/associations/contacts/${contactId}/deal_to_contact`,
    { method: "PUT" },
  );

  return deal;
}

export async function createHubspotNote(
  lead: Lead,
  contactId: string,
  dealId: string,
) {
  if (!lead.message) {
    return null;
  }

  const note = await hubspotRequest<HubspotObjectResponse>(
    "/crm/v3/objects/notes",
    {
      method: "POST",
      body: JSON.stringify({
        properties: {
          hs_note_body: `Lead message from CRM Sync Dashboard:\n\n${lead.message}`,
          hs_timestamp: new Date().toISOString(),
        },
      }),
    },
  );

  await Promise.allSettled([
    hubspotRequest(
      `/crm/v3/objects/notes/${note.id}/associations/contacts/${contactId}/note_to_contact`,
      { method: "PUT" },
    ),
    hubspotRequest(
      `/crm/v3/objects/notes/${note.id}/associations/deals/${dealId}/note_to_deal`,
      { method: "PUT" },
    ),
  ]);

  return note;
}

export async function syncLeadToHubSpot(leadId: string) {
  const lead = await prisma.lead.findUniqueOrThrow({ where: { id: leadId } });

  await prisma.lead.update({
    where: { id: leadId },
    data: { syncStatus: "PENDING", syncError: null },
  });

  try {
    const contact = await upsertHubspotContact(lead);
    const deal = lead.hubspotDealId
      ? { id: lead.hubspotDealId }
      : await createHubspotDeal(lead, contact.id);

    if (!lead.hubspotDealId) {
      await createHubspotNote(lead, contact.id, deal.id);
    }

    return prisma.lead.update({
      where: { id: leadId },
      data: {
        hubspotContactId: contact.id,
        hubspotDealId: deal.id,
        syncStatus: "SYNCED",
        syncError: null,
        lastSyncedAt: new Date(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown HubSpot sync error.";

    return prisma.lead.update({
      where: { id: leadId },
      data: {
        syncStatus: "FAILED",
        syncError: message,
      },
    });
  }
}
