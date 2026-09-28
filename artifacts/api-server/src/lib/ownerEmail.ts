const recipient = "hurst2001@gmail.com";

type Notification = {
  key: string;
  subject: string;
  lines: string[];
};

async function sendEmail(to: string, subject: string, lines: string[]): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const fromAddress = process.env.BREVO_FROM_EMAIL;
  if (!apiKey || !fromAddress) {
    throw new Error("BREVO_API_KEY and BREVO_FROM_EMAIL are required for transactional email.");
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
      to: [{ email: to }],
      subject,
      textContent: lines.join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo email request failed (${response.status})`);
  }
}

export async function sendOwnerNotification(notification: Notification): Promise<void> {
  await sendEmail(recipient, notification.subject, [
    ...notification.lines,
    "",
    "Sign in to the Admin Dashboard to review new enquiries and registrations.",
  ]);
}

export async function sendCustomerConfirmation(
  email: string,
  subject: string,
  lines: string[],
): Promise<void> {
  await sendEmail(email, subject, [
    "Greyton Murder Mysteries",
    "",
    ...lines,
    "",
    "If anything needs changing, please contact us.",
    "",
    "Greyton Murder Mysteries",
  ]);
}