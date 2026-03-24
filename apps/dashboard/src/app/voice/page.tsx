'use client';

import { useState } from 'react';
import { Activity, Blocks, Mic, Settings } from 'lucide-react';
import Link from 'next/link';

export default function VoicePage() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [intent, setIntent] = useState<any>(null);

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      // Mocking pipeline response since we can't capture local mic trivially without deploying the Fastify API fully
      setTimeout(() => {
        setTranscript("Remind me to check the database tomorrow");
        setIntent({
          intent: "set_reminder",
          params: { topic: "check the database", time: "tomorrow" },
          confidence: 0.98,
          response_text: "I'll remind you to check the database tomorrow."
        });
      }, 1000);
    } else {
      setRecording(true);
      setTranscript('');
      setIntent(null);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">CS</div>
          <span className="text-lg font-semibold tracking-tight">ClawShield</span>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 border-r p-4 hidden md:flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Activity className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/voice" className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-primary transition-colors">
            <Mic className="h-4 w-4" /> Voice Control
          </Link>
          <Link href="/skills" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Blocks className="h-4 w-4" /> Skill Store
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>

        <main className="flex-1 p-6 flex flex-col items-center justify-center">
          <button 
            onClick={toggleRecording}
            className={`flex h-48 w-48 items-center justify-center rounded-full transition-all duration-500 shadow-2xl ${
              recording ? 'bg-red-500 scale-110 shadow-[0_0_50px_#ef4444]' : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            <Mic className={`h-16 w-16 ${recording ? 'text-white animate-pulse' : 'text-primary'}`} />
          </button>
          <p className="mt-8 text-lg font-medium text-muted-foreground">
            {recording ? "Listening..." : "Tap to speak"}
          </p>

          {(transcript || intent) && (
            <div className="mt-12 w-full max-w-2xl rounded-xl border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-4 pb-4 border-b">
                <p className="text-sm font-semibold text-muted-foreground">You said:</p>
                <p className="text-lg">"{transcript}"</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Agent parsed intent:</p>
                <pre className="bg-background p-4 rounded-md text-xs font-mono overflow-x-auto text-primary">
                  {JSON.stringify(intent, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
