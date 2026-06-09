import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DialogProvider from "@/components/providers/DialogProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ThemeScript from "@/components/providers/ThemeScript";

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
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.variable} min-h-screen bg-dark-base text-text-primary antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <DialogProvider>{children}</DialogProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
