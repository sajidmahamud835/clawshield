import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ClawShield Dashboard',
  description: 'Zero-terminal AI Agent control panel.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hardcoded dark theme class to enforce the premium aesthetic
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
