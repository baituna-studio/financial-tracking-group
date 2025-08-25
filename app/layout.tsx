import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Financial App - Manage Financial Group',
  description:
    'Aplikasi keuangan berbasis grup untuk mengelola pemasukan dan pengeluaran dengan fitur kolaborasi tim.',
  generator: 'Financial App',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Financial App - Manage Financial Group',
    description:
      'Aplikasi keuangan berbasis grup untuk mengelola pemasukan dan pengeluaran dengan fitur kolaborasi tim.',
    type: 'website',
    locale: 'id_ID',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Financial App - Manage Financial Group',
    description:
      'Aplikasi keuangan berbasis grup untuk mengelola pemasukan dan pengeluaran dengan fitur kolaborasi tim.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
