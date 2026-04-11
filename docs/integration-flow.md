# Oyik Dashboard Integration Flow

## Data Model

- `organizations`: one client company using the dashboard
- `profiles`: one dashboard login for that organization
- `leads`: every website visitor or caller
- `chat_sessions`: one website chatbot conversation
- `chat_messages`: every inbound and outbound chatbot message
- `voice_calls`: one Retell call
- `voice_transcript_turns`: every Retell transcript turn
- `webhook_events`: raw ingest log for idempotency and debugging

## Chatbot Flow

1. The website widget sends the visitor message into the dedicated n8n workflow for that organization.
2. The n8n workflow handles the conversation and property logic exactly like today.
3. After the assistant reply is formatted, n8n sends a server-to-server `POST` request to:

   `POST /api/chatbot/ingest`

4. The backend verifies `x-ingest-secret`, then:
   - upserts the lead
   - upserts the chat session
   - inserts the user and assistant messages
   - stores the raw webhook event
5. The dashboard reads those rows with Supabase RLS and shows them only to that organization.

### Required chatbot request headers

- `x-ingest-secret: <CHATBOT_INGEST_SECRET>`

### Recommended chatbot payload

```json
{
  "organizationId": "YOUR_ORGANIZATION_UUID",
  "eventId": "n8n-run-123-session-abc",
  "source": "n8n_chatbot",
  "eventType": "chat_message_ingested",
  "session": {
    "externalId": "s_1775794704298_y4c8deew",
    "channel": "website",
    "status": "open",
    "summary": "Visitor asked about renting in LE2.",
    "startedAt": "2026-04-11T10:00:00.000Z",
    "lastMessageAt": "2026-04-11T10:00:05.000Z",
    "metadata": {
      "workflow": "bm-estates-chatbot",
      "propertyFlow": "rent"
    }
  },
  "lead": {
    "externalLeadId": "session-s_1775794704298_y4c8deew",
    "fullName": "John Smith",
    "email": "john@example.com",
    "phone": "07123456789",
    "metadata": {
      "sourcePage": "/rentals"
    }
  },
  "messages": [
    {
      "externalId": "s_1775794704298_y4c8deew-user-1",
      "role": "user",
      "direction": "incoming",
      "content": "I need a flat in LE2",
      "sentAt": "2026-04-11T10:00:00.000Z"
    },
    {
      "externalId": "s_1775794704298_y4c8deew-agent-1",
      "role": "agent",
      "direction": "outgoing",
      "content": "Sure, what is your maximum monthly budget?",
      "sentAt": "2026-04-11T10:00:05.000Z"
    }
  ]
}
```

## How To Update The Current n8n Workflow

Keep your existing AI and property-search logic. Add one persistence step after the assistant reply is ready.

### Recommended n8n changes

1. Add a fixed `organizationId` value for that workflow.
2. Keep `sessionId` from the current chat trigger.
3. After `Format Output`, parse the assistant JSON so you can access `message`.
4. Add an HTTP Request node to `POST` the payload above into `/api/chatbot/ingest`.
5. Pass both messages:
   - the visitor input from `Parse Input Safely`
   - the assistant reply from `Format Output`
6. Keep the HTTP Request authenticated with `x-ingest-secret`.
7. If you want reuse across many clients, move the HTTP Request into one shared sub-workflow like `Persist Chat Session To Supabase`.

### Important note for your current workflow

Do not replace the final chat response with the ingest response. Keep the normal chatbot output flowing back to the website, and run the persistence request as a side step that posts to the dashboard backend.

## Retell Flow

1. Each organization has its own Retell agent or phone number.
2. When creating or configuring that agent, include:

```json
{
  "organization_id": "YOUR_ORGANIZATION_UUID"
}
```

3. Point Retell webhooks to:

   `POST /api/retell/webhook`

4. The backend verifies `x-retell-signature`, then:
   - reads `metadata.organization_id`
   - upserts the lead from caller info
   - upserts the voice call
   - upserts transcript turns
   - stores the raw webhook event

### Recommended Retell metadata

```json
{
  "organization_id": "YOUR_ORGANIZATION_UUID",
  "lead_name": "John Smith",
  "lead_email": "john@example.com"
}
```

## Frontend Behavior

- Signup creates one organization and one profile.
- The dashboard owner logs in with Supabase Auth.
- The browser reads only rows for its own `organization_id`.
- Chatbot and voice screens show:
  - recent sessions/calls
  - lead details
  - full transcripts stored in Supabase

## Supabase Setup Order

1. Run `supabase/schema.sql` in your Supabase SQL editor.
2. Add the env values from `.env.example`.
3. Update each n8n workflow with its fixed organization ID and the ingest HTTP call.
4. Update each Retell agent to include `metadata.organization_id` and use the webhook route.
5. Sign up a new organization owner and test:
   - one website chatbot session
   - one Retell call
   - one dashboard login showing only that client's data
