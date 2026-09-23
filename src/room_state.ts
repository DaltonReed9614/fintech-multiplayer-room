export type PaymentEvent = {
  eventId: string;
  accountId: string;
  amountCents: number;
  status: "authorized" | "settled" | "reversed";
};

export type RoomState = { settledCents: number; audit: PaymentEvent[] };

export function applyPayment(state: RoomState, payment: PaymentEvent): RoomState {
  if (state.audit.some((entry) => entry.eventId === payment.eventId)) return state;
  const delta = payment.status === "settled" ? payment.amountCents : payment.status === "reversed" ? -payment.amountCents : 0;
  return { settledCents: state.settledCents + delta, audit: [...state.audit, payment] };
}
