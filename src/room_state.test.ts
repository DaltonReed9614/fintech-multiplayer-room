import test from "node:test";
import assert from "node:assert/strict";
import { applyPayment } from "./room_state.ts";

test("a retried settlement stays auditable but changes the balance once", () => {
  const payment = { eventId: "evt-1", accountId: "acct-1", amountCents: 500, status: "settled" as const };
  const first = applyPayment({ settledCents: 0, audit: [] }, payment);
  const second = applyPayment(first, payment);
  assert.equal(second.settledCents, 500);
  assert.equal(second.audit.length, 1);
});
