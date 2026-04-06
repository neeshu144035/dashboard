import { Call, Chat } from './types'

export const stats = {
  messages: { value: 4821, change: '+12.4%' },
  calls: { value: 1293, change: '+8.1%' },
  conversion: { value: '34.7%', change: '+2.3%' },
}

export const calls: Call[] = [
  {
    id: 'CALL-8821',
    date: 'Apr 6',
    duration: '4m 32s',
    number: '+91 98765',
    status: 'completed',
    summary: 'Caller enquired about Pro plan pricing. Agent upsold annual plan at ₹2,083/mo. Conversion successful.',
    transcript: [
      { role: 'agent', text: 'Hi! Thank you for calling Oyik AI. How can I assist you?' },
      { role: 'user', text: 'I wanted to know the difference between Standard and Pro plans.' },
      { role: 'agent', text: 'Pro is ₹2,499/mo with voice access and 10,000 messages. Standard is ₹999/mo chatbot-only.' },
      { role: 'user', text: 'Any annual discount?' },
      { role: 'agent', text: 'Annual billing gives 2 months free — ₹2,083/mo effective. Want me to send a payment link?' },
      { role: 'user', text: 'Yes please!' },
    ],
  },
  {
    id: 'CALL-8820',
    date: 'Apr 6',
    duration: '1m 12s',
    number: '+91 87654',
    status: 'missed',
    summary: 'Caller dropped before full response. Duration: 1m 12s. Likely a network issue.',
    transcript: [
      { role: 'agent', text: 'Hello! Oyik AI support, how can I help?' },
      { role: 'user', text: 'Yes I wanted to—' },
      { role: 'agent', text: 'Hello? Are you still there?' },
      { role: 'user', text: '(call dropped)' },
    ],
  },
  {
    id: 'CALL-8819',
    date: 'Apr 5',
    duration: '6m 04s',
    number: '+91 76543',
    status: 'completed',
    summary: 'Support call for chatbot widget embed setup. Agent guided user through full configuration. Resolved.',
    transcript: [
      { role: 'agent', text: 'Good evening! How can I help you today?' },
      { role: 'user', text: 'I need help setting up the chatbot widget on my website.' },
      { role: 'agent', text: 'Go to Dashboard → Chatbot → Embed Code and copy the snippet.' },
      { role: 'user', text: 'Where exactly do I paste it?' },
      { role: 'agent', text: 'Paste it before the closing </body> tag. It will auto-initialize.' },
      { role: 'user', text: 'Working perfectly now, thank you!' },
    ],
  },
]

export const chats: Chat[] = [
  {
    id: 'CHAT-5521',
    date: 'Apr 6',
    messages: 8,
    status: 'resolved',
    summary: 'User needed help integrating Oyik with HubSpot CRM. Agent provided API setup steps. Resolved in 8 exchanges.',
    transcript: [
      { role: 'agent', text: 'Hello! Welcome to Oyik AI support.' },
      { role: 'user', text: 'How do I connect Oyik with HubSpot?' },
      { role: 'agent', text: 'Go to Settings → Integrations → CRM and paste your HubSpot API key.' },
      { role: 'user', text: 'Contacts still not syncing.' },
      { role: 'agent', text: 'Ensure the key has Contacts read/write scope and set webhook to api.oyik.ai/webhook/hubspot' },
      { role: 'user', text: 'That fixed it! Thank you!' },
    ],
  },
  {
    id: 'CHAT-5520',
    date: 'Apr 6',
    messages: 3,
    status: 'open',
    summary: 'User asked about pricing plans. Still open — awaiting reply after pricing options were shared.',
    transcript: [
      { role: 'agent', text: 'Hi! How can I help today?' },
      { role: 'user', text: 'What are your pricing plans?' },
      { role: 'agent', text: 'Standard (₹999/mo), Pro (₹2,499/mo), Enterprise (custom pricing). Which suits you?' },
    ],
  },
  {
    id: 'CHAT-5519',
    date: 'Apr 5',
    messages: 12,
    status: 'resolved',
    summary: 'User reported chatbot not loading on mobile. Identified as browser cache issue. Resolved after cache clear.',
    transcript: [
      { role: 'agent', text: 'Hello, how can I assist?' },
      { role: 'user', text: 'The chatbot doesn\'t work on my phone.' },
      { role: 'agent', text: 'Try clearing your browser cache and reloading.' },
      { role: 'user', text: 'That worked! Thanks.' },
      { role: 'agent', text: 'Great! Anything else I can help with?' },
      { role: 'user', text: 'No, all good now.' },
    ],
  },
]
