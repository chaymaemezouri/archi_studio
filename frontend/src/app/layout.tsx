import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DialogProvider from "@/components/providers/DialogProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ThemeScript from "@/components/providers/ThemeScript";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    <html
      lang="fr"
      className={`${inter.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-dark-base font-sans text-text-primary antialiased`}
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
