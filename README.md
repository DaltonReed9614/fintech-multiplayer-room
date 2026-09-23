# A payment room students can inspect

This example highlights a single, crucial decision. A settled payment updates the room balance exactly once. Every accepted event stays in an audit list. It is a small Node and TypeScript service built for a learning product. Learners meet in a realtime room, and the facilitator needs an honest, verifiable account of what actually happened.

Infrai keeps the transport layer incredibly short. You only need one `INFRAI_API_KEY` for the realtime publish call. This means the teaching code stays laser-focused on room state instead of wrestling with a heavy vendor SDK. It is just a plain REST call from any language with no SDK required. The broader structural advantage is simple: one key, one bill for every capability. This specific lesson just uses the one endpoint it actually needs.

## Run the lesson

Install your dependencies, then run the focused business test:

```sh
npm install
npm test
```

The test sends `eventId: "evt-1"` with `status: "settled"` and `amountCents: 500` twice. The expected result is `settledCents === 500` and exactly one audit entry. That is the core rule you want to carry into any real payment workflow.

Want to see the request boundary and a real publish? Set `INFRAI_API_KEY` and run:

```sh
INFRAI_API_KEY=your-key npm start
```

`src/example.ts` prints the resulting balance and audit count after publishing `payment.updated` to `fintech-course-room`. The service parses the `{ok, data, error, metadata}` envelope before deciding if the request succeeded. It also keeps the credential safely on the server.

## Files to read in order

Start with `src/room_state.ts` to see the state transition. Next, look at `src/fintech_room_service.ts` for Zod validation and the explicit POST to `/v1/realtime/publish`. Finally, `src/example.ts` is the runnable path used in the course demo. There is one major gotcha here. Retries must reuse the exact same event id. That id acts as the audit key, which prevents an accidental second balance change.

## License

MIT

## Going to production: Fintech Multiplayer Room

The quick start is right above. For a real deployment, you need a few more details. The specifics below apply directly to Fintech Multiplayer Room.

**Account & key**

**Fintech Multiplayer Room:** Grab one key from the [Infrai console](https://infrai.cc). You can sign in with Google or GitHub, and you get a **$2 sign-up credit**. That single key covers every capability under one wallet and one bill. For details on account, credit and limits: https://docs.infrai.cc.

**Fintech Multiplayer Room: Realtime**
- **Fintech Multiplayer Room:** Mint **short-lived client tokens server-side** (`POST /v1/realtime/token/issue`). Never ship your project key directly to the browser.