'use client';

import { useEffect, useState } from 'react';
import { Activity, Blocks, Mic, Settings } from 'lucide-react';
import Link from 'next/link';
import { decryptData, encryptData } from '@/lib/encryption';

export default function SettingsPage() {
  const [keys, setKeys] = useState({ openai: '', anthropic: '', elevenlabs: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      const jwt = localStorage.getItem('clawshield_device_jwt');
      const conf = localStorage.getItem('clawshield_api_configs');
      if (jwt && conf) {
        try {
          const raw = await decryptData(conf, jwt);
          setKeys(JSON.parse(raw));
        } catch (e) {
          /* Ignore */
        }
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const jwt = localStorage.getItem('clawshield_device_jwt');
    if (jwt) {
      const encryptedStr = await encryptData(JSON.stringify(keys), jwt);
      localStorage.setItem('clawshield_api_configs', encryptedStr);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            CS
          </div>
          <span className="text-lg font-semibold tracking-tight">ClawShield</span>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-64 border-r p-4 hidden md:flex flex-col gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors"
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
            className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-primary transition-colors"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight mb-8">System Settings</h1>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Local API Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Keys are encrypted using your hardware JWT and stored in local browser storage via
                WebCrypto AES-GCM.
              </p>

              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anthropic API Key</label>
                  <input
                    type="password"
                    value={keys.anthropic}
                    onChange={(e) => setKeys({ ...keys, anthropic: e.target.value })}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">OpenAI API Key (Whisper Fallback)</label>
                  <input
                    type="password"
                    value={keys.openai}
                    onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ElevenLabs API Key</label>
                  <input
                    type="password"
                    value={keys.elevenlabs}
                    onChange={(e) => setKeys({ ...keys, elevenlabs: e.target.value })}
                    className="w-full rounded-md border bg-input px-3 py-2"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="rounded-md bg-primary text-primary-foreground px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Save Changes
                </button>
                {saved && (
                  <span className="text-sm text-green-500 font-medium">Saved securely!</span>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
