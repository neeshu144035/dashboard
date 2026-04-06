-- Create table for chatbot sessions
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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
CREATE TABLE IF NOT EXISTS voice_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  call_id TEXT NOT NULL,
  date TEXT NOT NULL,
  duration TEXT NOT NULL,
  number TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  summary TEXT,
  transcript JSONB DEFAULT '[]',
  conversion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_calls ENABLE ROW LEVEL SECURITY;

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

-- RLS policies for voice_calls
CREATE POLICY "Users can view their own voice calls" 
  ON voice_calls FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice calls" 
  ON voice_calls FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice calls" 
  ON voice_calls FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice calls" 
  ON voice_calls FOR DELETE 
  USING (auth.uid() = user_id);
