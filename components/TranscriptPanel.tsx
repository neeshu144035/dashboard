'use client'

import { Message } from '@/lib/types'

interface TranscriptPanelProps {
  summary: string
  transcript: Message[]
}

export default function TranscriptPanel({ summary, transcript }: TranscriptPanelProps) {
  return (
    <div className="space-y-4">
      <div className="bg-oyik-cream rounded-2xl shadow-nm-raised p-6">
        <h3 className="text-sm font-semibold text-oyik-navy mb-2">Summary</h3>
        <p className="text-sm text-oyik-text">{summary || 'No summary available'}</p>
      </div>

      <div className="bg-oyik-cream rounded-2xl shadow-nm-raised p-6">
        <h3 className="text-sm font-semibold text-oyik-navy mb-4">Transcript</h3>
        {transcript.length === 0 ? (
          <p className="text-oyik-muted text-sm">No transcript available</p>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {transcript.map((message: Message, index: number) => {
              const isSameAsPrevious = index > 0 && transcript[index - 1].role === message.role;
              
              return (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''} ${isSameAsPrevious ? '-mt-2' : ''}`}
                >
                  {/* Only show avatar if it's the first message in a sequence or reversed for user */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'agent'
                        ? 'bg-oyik-lavender text-oyik-purple'
                        : 'bg-gray-100 text-gray-500'
                    } ${isSameAsPrevious ? 'opacity-0' : 'opacity-100'}`}
                  >
                    {!isSameAsPrevious && (message.role === 'agent' ? 'AI' : 'U')}
                  </div>
                  
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      message.role === 'agent'
                        ? 'bg-[#f5f3ff] border border-[#ddd6fe] text-oyik-text'
                        : 'bg-oyik-purple text-white'
                    } ${isSameAsPrevious ? 'rounded-tl-sm' : ''} ${isSameAsPrevious && message.role === 'user' ? 'rounded-tr-sm' : ''}`}
                  >
                    <p>{message.text}</p>
                    {message.timestamp && !isSameAsPrevious ? (
                      <p
                        className={`mt-2 text-[11px] ${
                          message.role === 'agent' ? 'text-oyik-muted' : 'text-white/70'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
