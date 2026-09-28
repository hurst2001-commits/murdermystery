const recipient = "hurst2001@gmail.com";

type Notification = {
  key: string;
  subject: string;
  lines: string[];
};

export async function sendOwnerNotification(notification: Notification): Promise<void> {
  const text = [
    ...notification.lines,
    "",
    "Sign in to the Admin Dashboard to review new enquiries and registrations.",
  ].join("\n");

  const apiKey = process.env.BREVO_API_KEY;
  const fromAddress = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !fromAddress) {
    throw new Error("BREVO_API_KEY and BREVO_FROM_EMAIL are required for owner notifications.");
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
}