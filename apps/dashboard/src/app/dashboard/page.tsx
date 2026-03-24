'use client';

import { useAgentSocket } from '@/lib/agent-socket';
import { Activity, Mic, Settings, Blocks } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { status, messages } = useAgentSocket();

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Top Navigation */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            CS
          </div>
          <span className="text-lg font-semibold tracking-tight">ClawShield</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-3 w-3">
              {status === 'connected' && (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
                </>
              )}
              {status === 'connecting' && (
                <span className="relative inline-flex h-3 w-3 rounded-full bg-yellow-500"></span>
              )}
              {status !== 'connected' && status !== 'connecting' && (
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
              )}
            </span>
            {status}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r p-4 hidden md:flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-primary transition-colors"
          >
            <Activity className="h-4 w-4" /> Dashboard
          </Link>
          <Link
            href="/voice"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
          >
            <Mic className="h-4 w-4" /> Voice Control
          </Link>
          <Link
            href="/skills"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
          >
            <Blocks className="h-4 w-4" /> Skill Store
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>

        {/* Console / Reasoning Trace */}
        <main className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">Agent reasoning trace</h1>
          </div>

          <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-center mt-20">
                  Waiting for agent activity...
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="flex flex-col border-b border-border/50 pb-2">
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'N/A'} [
                      {msg.type}]
                    </span>
                    <pre className="mt-1 whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
