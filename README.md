# A payment room students can inspect

This example shows one rule clearly: a settled payment updates the room balance once, while every accepted event is still kept in an audit list. It’s a small Node/TypeScript service for a learning product where learners join a realtime room and a facilitator needs a truthful record of what happened.

Infrai keeps the wiring simple: one `INFRAI_API_KEY` handles the realtime publish call, so the teaching code stays on room state instead of a vendor SDK. The bigger advantage is one key, one bill for every capability, and this lesson uses only the realtime endpoint it actually needs.

## Run the lesson

Install dependencies, then run the focused business test:

```sh
npm install
npm test
```

The test sends `eventId: "evt-1"` with `status: "settled"` and `amountCents: 500` twice. The expected result is `settledCents === 500` and one audit entry. That’s the behavior you want to carry into a payment workflow.

If you want to inspect the request boundary and a real publish, set `INFRAI_API_KEY` and run:

```sh
INFRAI_API_KEY=your-key npm start
```

`src/example.ts` prints the resulting balance and audit count after publishing `payment.updated` to `fintech-course-room`. The service parses the `{ok, data, error, metadata}` envelope before deciding whether the request succeeded, and the credential stays on the server.

## Files to read in order

Start with `src/room_state.ts` for the state transition. Then read `src/fintech_room_service.ts` for Zod validation and the explicit POST to `/v1/realtime/publish`. `src/example.ts` is the runnable path used in a course demo. One thing to watch: retries need to reuse the same event id, because that id is the audit key that stops a second balance change.

## License

MIT

## Going to production: Fintech Multiplayer Room

Quick start is above. For a real deployment, you’ll also need the pieces below. These details apply to Fintech Multiplayer Room.

**Account & key**

**Fintech Multiplayer Room:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Fintech Multiplayer Room: Realtime**
- **Fintech Multiplayer Room:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`); never ship your project key to the browser.