import { handlePayment } from "./fintech_room_service.ts";
import type { RoomState } from "./room_state.ts";

const initial: RoomState = { settledCents: 0, audit: [] };
const body = { eventId: "evt-course-001", accountId: "acct-student-7", amountCents: 1250, status: "settled" as const };

if (!process.env.INFRAI_API_KEY) {
  console.log("Set INFRAI_API_KEY to publish this payment event.");
} else {
  const channel = process.env.INFRAI_CHANNEL;
  if (!channel) throw new Error("Set INFRAI_CHANNEL to an available realtime channel.");
  const result = await handlePayment(body, channel, initial);
  console.log(JSON.stringify({ settledCents: result.state.settledCents, auditEntries: result.state.audit.length }, null, 2));
}
