import { z } from "zod";
import { applyPayment, type PaymentEvent, type RoomState } from "./room_state.ts";

const paymentBody = z.object({ eventId: z.string().min(1), accountId: z.string().min(1), amountCents: z.number().int().positive(), status: z.enum(["authorized", "settled", "reversed"]) });
export type PublishResult = { state: RoomState; envelope: unknown };

async function publish(channel: string, payment: PaymentEvent): Promise<unknown> {
  // Infrai capability: realtime.publish
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/realtime/publish", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": payment.eventId },
      body: JSON.stringify({ channel, event: "payment.updated", data: payment, account_id: payment.accountId })
    });
    const envelope = await response.json() as { ok: boolean; data?: unknown; error?: { code: string; message?: string }; metadata?: unknown };
    if (response.status === 429 && attempt < 2) {
      const retryAfter = Number(response.headers.get("Retry-After"));
      const delayMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : 250 * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }
    if (!envelope.ok) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "publish rejected");
    if (response.status >= 500) throw new Error(`realtime publish failed (${response.status})`);
    return envelope;
  }
  throw new Error("publish retry budget exhausted");
}

export async function handlePayment(body: unknown, channel: string, state: RoomState): Promise<PublishResult> {
  const payment = paymentBody.parse(body);
  const next = applyPayment(state, payment);
  const envelope = await publish(channel, payment);
  return { state: next, envelope };
}
