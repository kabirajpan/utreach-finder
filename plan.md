# WhatsApp Bulk Messaging Backend

## Stack

| Layer | Tech |
|---|---|
| Runtime | Bun |
| Framework | Hono |
| DB | MongoDB (mongoose) |
| HTTP Client | Native fetch (Bun built-in) |
| Env | Bun built-in `.env` |
| Dev tunnel | ngrok |

---

## Project Structure

```
whatsapp-bulk/
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── routes/
│   │   ├── webhook.ts
│   │   ├── messages.ts
│   │   └── contacts.ts
│   ├── services/
│   │   └── whatsapp.ts
│   ├── queue/
│   │   └── messageQueue.ts
│   ├── models/
│   │   ├── Contact.ts
│   │   └── MessageLog.ts
│   └── index.ts
├── .env
└── package.json
```

---

## Init

```bash
mkdir whatsapp-bulk && cd whatsapp-bulk
bun init -y
bun add hono mongoose
```

---

## Environment Variables (.env)

```env
WHATSAPP_TOKEN=
PHONE_NUMBER_ID=
WEBHOOK_VERIFY_TOKEN=
MONGO_URI=mongodb://localhost:27017/whatsapp_bulk
PORT=3000
```

---

## Models

### Contact
- `name` — string
- `phone` — string, unique, E.164 format (`+91XXXXXXXXXX`)
- `variables` — string array (maps to `{{1}}`, `{{2}}` in template)
- `tags` — string array (for filtering campaigns)
- `createdAt` — date

### MessageLog
- `phone` — string
- `templateName` — string
- `variables` — string array
- `status` — `queued | sent | failed`
- `wamid` — message ID returned by Meta
- `error` — string (if failed)
- `sentAt` — date

---

## Services

### whatsapp.ts
Wrapper around the Meta Graph API.

Responsibilities:
- `sendTemplateMessage(to, templateName, languageCode, variables[])` — builds the correct payload and POSTs to `https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages`
- Returns the `wamid` on success, throws on failure

### Template Variables

Each contact has a `variables[]` array that maps 1:1 to template placeholders.

```
Contact variables: ["Alice", "LinkedIn"]
Template body:     "Hi {{1}}, we found you on {{2}}."
Result:            "Hi Alice, we found you on LinkedIn."
```

If a contact has no variables, the fallback variables from the bulk request are used.

---

## Queue

### messageQueue.ts

Simple async loop with a delay between each message to stay within Meta's rate limits (~80 msg/sec; use 100ms delay to be safe = ~10 msg/sec).

Flow:
1. Receive list of jobs `{ phone, templateName, variables, logId }`
2. Loop with `setTimeout(100ms)` between each
3. Call `sendTemplateMessage`
4. Update `MessageLog` status to `sent` (with wamid) or `failed` (with error)
5. Log to console

The bulk send endpoint fires the queue without awaiting it — responds immediately with queued count.

---

## Routes

### POST /messages/send-bulk

Request body:
```json
{
  "templateName": "outreach_intro",
  "tags": ["lead"],
  "variables": ["Friend", "our platform"]
}
```

- Fetches contacts filtered by `tags` (or all if omitted)
- Creates a `MessageLog` entry per contact with status `queued`
- Fires queue in background
- Returns `{ success: true, total: N }`

### POST /messages/send-single

Request body:
```json
{
  "phone": "+919XXXXXXXXX",
  "templateName": "outreach_intro",
  "variables": ["Alice", "LinkedIn"]
}
```

### GET /contacts
Returns all contacts.

### POST /contacts
Add a single contact.

### POST /contacts/bulk-import
Body: `{ contacts: [{name, phone, variables, tags}] }`
Uses `insertMany` for performance.

### DELETE /contacts/:phone
Remove a contact.

### GET /webhook
Meta verification handshake — checks `hub.mode`, `hub.verify_token`, returns `hub.challenge`.

### POST /webhook
Receives inbound messages from Meta. Log the message for now; bot logic can be added later.

---

## Meta Webhook Setup (One-Time)

1. Go to [developers.facebook.com](https://developers.facebook.com) → Your App → WhatsApp → Configuration
2. Webhook URL: `https://your-ngrok-url/webhook`
3. Verify Token: same as `WEBHOOK_VERIFY_TOKEN` in `.env`
4. Click **Verify and Save**
5. Subscribe to **messages** field

For local dev: `ngrok http 3000`

---

## Dev Run

```bash
bun run src/index.ts
ngrok http 3000
```

---

## Next Steps

- [ ] CSV upload → parse → bulk import contacts
- [ ] GET /logs — query message logs by status/date
- [ ] Bot reply logic in POST /webhook
- [ ] Frontend UI — contact manager + campaign trigger