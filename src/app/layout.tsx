import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IndoVoice Studio - AI Indonesian Presentation Voice-Over',
  description: 'Aplikasi voice-over bahasa Indonesia hyper-realistic untuk presentasi magang, slide deck, dan video edukasi.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
