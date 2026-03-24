import { Activity, Blocks, Mic, Settings, Database, Code, Globe } from 'lucide-react';
import Link from 'next/link';

const MOCK_SKILLS = [
  { id: '1', name: 'Web Browser', status: 'installed', icon: Globe, desc: 'Enables the agent to search the live internet.' },
  { id: '2', name: 'Postgres SQL', status: 'available', icon: Database, desc: 'Connect to external databases using secure credentials.' },
  { id: '3', name: 'Python Sandbox', status: 'installed', icon: Code, desc: 'Executes generated python code in a temporary docker container.' },
];

export default function SkillsPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      <header className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">CS</div>
          <span className="text-lg font-semibold tracking-tight">ClawShield</span>
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 border-r p-4 hidden md:flex flex-col gap-2">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Activity className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/voice" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Mic className="h-4 w-4" /> Voice Control
          </Link>
          <Link href="/skills" className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2 text-primary transition-colors">
            <Blocks className="h-4 w-4" /> Skill Store
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-secondary/50 hover:text-primary transition-colors">
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold tracking-tight mb-6">Skill Store</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_SKILLS.map(skill => (
              <div key={skill.id} className="rounded-xl border bg-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <skill.icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{skill.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{skill.desc}</p>
                </div>
                <div className="flex justify-end">
                  {skill.status === 'installed' ? (
                    <button className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive px-4 py-2 text-sm font-medium hover:bg-destructive/20 transition-colors">
                      Uninstall
                    </button>
                  ) : (
                    <button className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
                      Install
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
