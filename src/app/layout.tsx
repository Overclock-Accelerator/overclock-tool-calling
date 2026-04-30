import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Overclock Tool Calling",
  description: "AI Operations Accelerator — Unit 5: Tool-Powered Chat Interfaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} bg-[#0a0a0a] text-white min-h-full flex flex-col antialiased`}>
        <Navbar />
        <main className="flex-1 flex flex-col pt-14">
          {children}
        </main>
      </body>
    </html>
  );
}
