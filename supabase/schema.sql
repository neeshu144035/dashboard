-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for chatbot sessions
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  date TEXT NOT NULL,
  messages_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open',
  summary TEXT,
  transcript JSONB DEFAULT '[]',
  conversion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for voice agent calls
CREATE TABLE IF NOT EXISTS voice_agent_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  call_id TEXT NOT NULL,
  summary TEXT,
  transcript JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_agent_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations
CREATE POLICY "Users can view their organization" 
  ON organizations FOR SELECT 
  USING (
    id IN (
      SELECT organization_id FROM chatbot_sessions WHERE user_id = auth.uid()
      UNION
      SELECT organization_id FROM voice_agent_calls WHERE user_id = auth.uid()
    )
  );

-- RLS policies for chatbot_sessions
CREATE POLICY "Users can view their own chatbot sessions" 
  ON chatbot_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chatbot sessions" 
  ON chatbot_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chatbot sessions" 
  ON chatbot_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chatbot sessions" 
  ON chatbot_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for voice_agent_calls
CREATE POLICY "Users can view their own voice calls" 
  ON voice_agent_calls FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice calls" 
  ON voice_agent_calls FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice calls" 
  ON voice_agent_calls FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice calls" 
  ON voice_agent_calls FOR DELETE 
  USING (auth.uid() = user_id);
