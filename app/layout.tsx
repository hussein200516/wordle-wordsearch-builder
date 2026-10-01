import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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
  title: "Wordle & Word Search Activity Builder",
  description: "Data-driven web application and reporting tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
          <nav 
            aria-label="Main Navigation" 
            className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"
          >
            {/* Brand Logo / Home Link */}
            <Link 
              href="/" 
              className="text-lg font-extrabold tracking-tight text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              ActivityBuilder
            </Link>

            {/* Main Navigation Links */}
            <div className="flex items-center gap-1 md:gap-2">
              <Link 
                href="/" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/wordle" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Wordle
              </Link>
              <Link 
                href="/wordsearch" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Word Search
              </Link>
              <Link 
                href="/reports" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Reports
              </Link>
              <Link 
                href="/settings" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Settings
              </Link>
              <Link 
                href="/about" 
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                About
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content View */}
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}