import type { Metadata, Viewport } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

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
      <body className="gradient-bg min-h-screen font-sans antialiased bg-[#030816]">
        {/* Animated Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#9333EA]/20 blur-[100px] animate-blob mix-blend-screen" />
          <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#38BDF8]/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen" />
          <div className="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#1E3A8A]/30 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen" />
          <div className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] rounded-full bg-[#C026D3]/15 blur-[100px] animate-blob mix-blend-screen" />
        </div>

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
