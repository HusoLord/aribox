import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ARIBox — Akıllı Arıcılık Platformu",
    template: "%s | ARIBox",
  },
  description: "Arıcılık sektörüne yönelik yapay zeka destekli kapsamlı dijital platform. Kovan yönetimi, hastalık teşhisi, marketplace ve daha fazlası.",
  keywords: ["arıcılık", "kovan yönetimi", "bal", "arı", "yapay zeka", "arıcı"],
  authors: [{ name: "ARIBox" }],
  creator: "ARIBox",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "ARIBox",
    title: "ARIBox — Akıllı Arıcılık Platformu",
    description: "Arıcılık sektörüne yönelik yapay zeka destekli kapsamlı dijital platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f59e0b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(()=>{}) }`,
          }}
        />
      </body>
    </html>
  );
}
