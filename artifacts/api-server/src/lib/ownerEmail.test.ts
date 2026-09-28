import assert from "node:assert/strict";
import { after, test } from "node:test";
import { sendCustomerConfirmation, sendOwnerNotification } from "./ownerEmail";

const originalFetch = globalThis.fetch;
process.env.BREVO_API_KEY = "test-only-key";
process.env.BREVO_FROM_EMAIL = "sender@example.test";

after(() => {
  globalThis.fetch = originalFetch;
});

test("owner and customer emails use the same Brevo sender and separate recipients", async () => {
  const sent: Record<string, unknown>[] = [];
  globalThis.fetch = async (_url, options) => {
    sent.push(JSON.parse(String(options?.body)) as Record<string, unknown>);
    return new Response(null, { status: 201 });
  };

  await sendOwnerNotification({
    key: "booking-test",
    subject: "New enquiry",
    lines: ["Name: Test Guest"],
  });
  await sendCustomerConfirmation("guest@example.test", "Enquiry received", [
    "Hello Test Guest,",
    "This is an acknowledgement, not a confirmed booking.",
  ]);

  assert.equal(sent.length, 2);
  assert.deepEqual(sent[0].to, [{ email: "hurst2001@gmail.com" }]);
  assert.deepEqual(sent[1].to, [{ email: "guest@example.test" }]);
  assert.deepEqual(sent[0].sender, sent[1].sender);
  assert.match(String(sent[1].textContent), /not a confirmed booking/);
});

test("a failed Brevo request rejects so the route can log it", async () => {
  globalThis.fetch = async () => new Response(null, { status: 503 });
  await assert.rejects(
    sendCustomerConfirmation("guest@example.test", "Enquiry received", ["Hello"]),
    /Brevo email request failed \(503\)/,
  );
});