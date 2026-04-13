# Oyik RealEstate Dashboard - Project Summary

## Project Overview
A real estate dashboard built with Next.js + Supabase for managing chatbot conversations and Retell voice calls.

---

## Current URL
```
https://dashboard-2xmwcv7xc-neeshuvaninagara-6931s-projects.vercel.app
```

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
│   ├── ChatbotView.tsx               # Chat sessions list
│   └── VoiceAgentView.tsx            # Voice calls list
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

## The Problem

### Current Issue:
n8n sends data to the chatbot ingest API but returns error:
```json
{ "ok": false, "error": "Unable to ingest chatbot payload" }
```

### Investigation:
1. Deployment protection (Vercel auth) was blocking n8n - FIXED by disabling protection
2. Removed secret validation from API
3. Simplified the ingest function
4. Still failing - 405 error or general error

### What n8n sends:
```json
{
  "organizationId": "095aa09e-bf16-4958-be45-42c05762ed63",
  "sessionId": "s_1776072445818_4xm0wgwp",
  "userMessage": "mmm",
  "botResponse": {
    "message": "And your email address?",
    "properties": []
  }
}
```

### Organization ID:
```
095aa09e-bf16-4958-be45-42c05762ed63 (BM Estate)
```

---

## n8n Setup

### HTTP Request Node Configuration:
- **URL:** `https://dashboard-2xmwcv7xc-neeshuvaninagara-6931s-projects.vercel.app/api/chatbot/ingest`
- **Method:** POST
- **Headers:**
  - Content-Type: application/json
- **Body (JSON):**
```json
{
  "organizationId": "095aa09e-bf16-4958-be45-42c05762ed63",
  "sessionId": "{{ $json.sessionId }}",
  "userMessage": "{{ $json.message }}",
  "botResponse": "{{ $json.output }}"
}
```

---

## Retell Setup

### Webhook URL:
```
https://dashboard-2xmwcv7xc-neeshuvaninagara-6931s-projects.vercel.app/api/retell/webhook
```

### Required Metadata:
```json
{
  "organization_id": "095aa09e-bf16-4958-be45-42c05762ed63"
}
```

---

## Next Steps (To Fix)

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Function Log
   - See exact error message

2. **Fix the API endpoint:**
   - Currently simplified to just echo back
   - Need to add proper Supabase insert logic back

3. **Test with cURL:**
```bash
curl -X POST https://dashboard-2xmwcv7xc-neeshuvaninagara-6931s-projects.vercel.app/api/chatbot/ingest \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"095aa09e-bf16-4958-be45-42c05762ed63","sessionId":"test-123","userMessage":"hello"}'
```

---

## Environment Variables (Vercel)

| Key | Value |
|-----|-------|
| NEXT_PUBLIC_SUPABASE_URL | https://uscotjkqicqxvddclglj.supabase.co |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| SUPABASE_SERVICE_ROLE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| CHATBOT_INGEST_SECRET | chatbot-secret-change-this |
| RESEND_API_KEY | re_EiZXCBPf_LgubmLHCBtbKZehCgXqhqrXq |

---

## GitHub Repo
```
https://github.com/neeshu144035/dashboard
```