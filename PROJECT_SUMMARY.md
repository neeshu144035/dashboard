# Oyik RealEstate Dashboard - Project Summary

## Project Overview
A real estate dashboard built with Next.js + Supabase for managing chatbot conversations and Retell voice calls.
**Current Design Theme:** Neumorphic Enterprise SaaS.

---

## Current URLs
**Production Interface:**
```
https://dashboard.oyik.ai
```

**Webhooks (Update external services to these):**
- Chatbot: `https://dashboard.oyik.ai/api/chatbot/ingest`
- Retell: `https://dashboard.oyik.ai/api/retell/webhook`

---

## Project Structure
```
Oyik-DashBoard/
├── app/
│   ├── api/
│   │   ├── chatbot/ingest/route.ts    # Receives n8n chat data
│   │   ├── retell/webhook/route.ts   # Receives Retell voice calls
│   │   ├── signup/route.ts           # User signup (Admin API)
│   │   ├── send-verification/route.ts
│   │   ├── send-password-reset/route.ts
│   │   └── verify/route.ts
│   ├── page.tsx                      # Main dashboard
│   └── reset-password/page.tsx
├── components/
│   ├── LoginPage.tsx                 # Auth UI
│   ├── ChatbotView.tsx               # Chat sessions list (Neumorphic)
│   ├── VoiceAgentView.tsx            # Voice calls list (Neumorphic)
│   ├── Sidebar.tsx                   # Main navigation
│   └── TranscriptPanel.tsx           # Smart grouped transcripts
├── lib/
│   ├── supabase.ts                   # Client (browser)
│   ├── supabase-admin.ts             # Server (service role)
│   ├── supabase-data.ts              # Data fetching functions
│   └── server-ingest.ts              # Chat/Retell processing
├── supabase/
│   └── schema.sql                    # DB schema
└── .env.local                        # Local env vars
```

---

## Database (Supabase)

### Tables Created:
- `organizations` - Client companies
- `profiles` - Dashboard users
- `leads` - Website visitors (DISABLED - not storing)
- `chat_sessions` - Chatbot conversations
- `chat_messages` - Individual messages
- `voice_calls` - Retell phone calls
- `voice_transcript_turns` - Call transcripts
- `webhook_events` - Raw webhook log

### RLS Policies:
All tables filtered by `organization_id` - users can only see their organization's data.

---

## Recent Updates & Fixes ✅

### 1. Webhook Fixes
- **Inbound Calls Fixed:** Inbound Retell calls now map correctly using hardcoded Agent IDs (`agent_xxxx`).
- **Duplicate Log Bug:** Fixed an issue where the safety net log was incorrectly flagging valid calls as duplicates.
- **Smart Numbers:** `to` and `from` numbers intelligently swap based on `direction` (Inbound vs Outbound).

### 2. UI Enhancements
- **Neumorphism:** Applied soft, rounded, tactile shadows (`shadow-nm-raised`, `shadow-nm-inset`) across all panels, sidebars, and stat cards.
- **Smart Grouping:** Consecutive transcript messages from the same speaker (AI or User) are grouped together into visual blocks without repeating icons or timestamps.

### Organization ID:
```
095aa09e-bf16-4958-be45-42c05762ed63 (BM Estate)
```

---

## Setup Instructions for Integrations

### 1. n8n Setup (Chatbot)
- **URL:** `https://dashboard.oyik.ai/api/chatbot/ingest`
- **Method:** POST
- **Body (JSON):**
```json
{
  "organizationId": "095aa09e-bf16-4958-be45-42c05762ed63",
  "sessionId": "{{ $json.sessionId }}",
  "userMessage": "{{ $json.message }}",
  "botResponse": "{{ $json.output }}"
}
```

### 2. Retell Setup (Voice)
- **Webhook URL:** `https://dashboard.oyik.ai/api/retell/webhook`
- Set this URL on **Agents** AND specific **Phone Numbers** (for inbound support).
- Current Allowed Agents:
  - `agent_ae930c223647893de0e20301f1` (Outbound)
  - `agent_260c6da594883877249f642474` (Inbound)

---

## GitHub Repo
```
https://github.com/neeshu144035/dashboard
```