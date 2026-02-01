import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MemoSphere - Your Personal Digital Assistant',
  description: 'Personal utility application for organizing your digital life with secure storage, smart scheduling, and organized note-taking',
  manifest: '/manifest.json',
  applicationName: 'MemoSphere',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MemoSphere',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icon-512x512.svg',
    apple: '/icon-512x512.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
