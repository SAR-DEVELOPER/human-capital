import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Human Capital | SAR Tax & Management Consultant",
  description: "Human Capital Management System - SAR Tax & Management Consultant",
};

/**
 * Root Layout for Human Capital App
 *
 * Authentication is handled by:
 * - middleware.ts: Route protection and auth checks
 * - lib/auth/client.ts: Client-side user info utilities
 * - lib/hooks/useAuth.ts: React hook for accessing user data in components
 *
 * This layout remains simple and delegates auth concerns to the middleware layer.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
