import { getDb } from "../db/client.js";
import { nowIso } from "../lib/utils.js";

export interface SendResult {
  providerSid: string | null;
  status: "sent" | "failed";
}

interface ProviderConfig {
  provider: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_from_number: string;
  default_sender_id: string;
}

function getConfig(): ProviderConfig {
  const db = getDb();
  const rows = db
    .prepare("SELECT key, value FROM settings")
    .all() as { key: string; value: string }[];
  return rows.reduce(
    (acc, r) => ({ ...acc, [r.key]: r.value }),
    {} as ProviderConfig
  );
}

async function sendViaMock(to: string, body: string): Promise<SendResult> {

  await new Promise((r) => setTimeout(r, 80 + Math.random() * 120));

  if (Math.random() < 0.05) {
    return { providerSid: null, status: "failed" };
  }

  const fakeSid = `MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  console.log(`[MOCK SMS] To: ${to} | Body: ${body.slice(0, 50)}`);
  return { providerSid: fakeSid, status: "sent" };
}

async function sendViaTwilio(
  to: string,
  body: string,
  config: ProviderConfig
): Promise<SendResult> {
  const { default: twilio } = await import("twilio");
  const client = twilio(config.twilio_account_sid, config.twilio_auth_token);

  try {
    const message = await client.messages.create({
      body,
      from: config.twilio_from_number || config.default_sender_id,
      to,
    });
    return { providerSid: message.sid, status: "sent" };
  } catch (err) {
    console.error("[TWILIO ERROR]", err);
    return { providerSid: null, status: "failed" };
  }
}

export async function sendSms(to: string, body: string): Promise<SendResult> {
  const config = getConfig();

  if (config.provider === "twilio" && config.twilio_account_sid) {
    return sendViaTwilio(to, body, config);
  }

  return sendViaMock(to, body);
}

export async function dispatchMessage(messageId: string): Promise<void> {
  const db = getDb();
  const msg = db
    .prepare("SELECT id, to_number, body FROM messages WHERE id = ? AND status = 'queued'")
    .get(messageId) as { id: string; to_number: string; body: string } | undefined;

  if (!msg) return;

  const result = await sendSms(msg.to_number, msg.body);

  db.prepare(
    "UPDATE messages SET status = ?, provider_sid = ?, sent_at = ? WHERE id = ?"
  ).run(result.status, result.providerSid, nowIso(), msg.id);

  const config = getConfig();
  if (config.provider !== "twilio" && result.status === "sent") {
    setTimeout(() => {
      try {
        db.prepare(
          "UPDATE messages SET status = 'delivered' WHERE id = ? AND status = 'sent'"
        ).run(msg.id);
      } catch {
      }
    }, 2000 + Math.random() * 3000);
  }
}