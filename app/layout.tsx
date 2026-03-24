import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CreditForge AI — Multi-Agent Credit Risk Assessment",
  description: "5 AI agents debate every credit decision. Multi-agent adversarial assessment for Indian NBFCs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        {children}
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  );
}
