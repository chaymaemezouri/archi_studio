import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Architecture Studio",
  description: "Plateforme de gestion pour cabinets d'architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className={`${inter.variable} min-h-screen bg-dark-base text-text-primary antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
