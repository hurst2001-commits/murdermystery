import { ReplitConnectors } from "@replit/connectors-sdk";

const recipient = "hurst2001@gmail.com";

type Notification = {
  key: string;
  subject: string;
  lines: string[];
};

export async function sendOwnerNotification(notification: Notification): Promise<void> {
  const externalDeployment = process.env.EXTERNAL_DEPLOYMENT === "true";
  const text = [
    ...notification.lines,
    "",
    "Sign in to the Admin Dashboard to review new enquiries and registrations.",
  ].join("\n");

  if (externalDeployment) {
    const apiKey = process.env.BREVO_API_KEY;
    const fromAddress = process.env.BREVO_FROM_EMAIL;
    if (!apiKey || !fromAddress) {
      throw new Error("BREVO_API_KEY and BREVO_FROM_EMAIL are required for external email.");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: "Greyton Murder Mysteries", email: fromAddress },
        to: [{ email: recipient }],
        subject: notification.subject,
        textContent: text,
      }),
    });
    if (!response.ok) {
      throw new Error(`Brevo email request failed (${response.status})`);
    }
    return;
  }

  const connectors = new ReplitConnectors();
  const domainsResponse = await connectors.proxy("resend", "/domains", {
    method: "GET",
  });
  if (!domainsResponse.ok) {
    throw new Error(`Resend domains request failed (${domainsResponse.status})`);
  }

  const domains = (await domainsResponse.json()) as {
    data?: Array<{ name: string; status: string }>;
  };
  const verifiedDomains = domains.data?.filter((domain) => domain.status === "verified") ?? [];
  const fromAddress = process.env.RESEND_FROM_EMAIL;
  if (!fromAddress && verifiedDomains.length !== 1) {
    throw new Error("Set RESEND_FROM_EMAIL to an address on a verified Resend domain");
  }
  const from = fromAddress ?? `notifications@${verifiedDomains[0].name}`;
  const senderDomain = from.split("@")[1]?.toLowerCase();
  if (
    !senderDomain ||
    !verifiedDomains.some(
      ({ name }) =>
        senderDomain === name.toLowerCase() ||
        senderDomain.endsWith(`.${name.toLowerCase()}`),
    )
  ) {
    throw new Error("RESEND_FROM_EMAIL must use a verified Resend domain");
  }

  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": notification.key,
    },
    body: JSON.stringify({
      from: `Greyton Murder Mysteries <${from}>`,
      to: [recipient],
      subject: notification.subject,
      text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend email request failed (${response.status})`);
  }
}