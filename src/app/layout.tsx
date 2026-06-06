import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

import AnimatedBackground from '@/components/AnimatedBackground';

export const metadata: Metadata = {
  title: 'Farid Entrepreneur | Track. Grow. Build.',
  description: 'Premium productivity app for entrepreneurs — Track habits, income, learning, investments, and fitness in one ecosystem.',
  keywords: 'habit tracker, income tracker, entrepreneur, productivity, fitness',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#061021',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="gradient-bg min-h-screen font-sans antialiased bg-[#061021]">
        <AnimatedBackground />

        <Sidebar />
        <main className="lg:ml-[260px] pt-16 pb-20 lg:pt-0 lg:pb-0 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
