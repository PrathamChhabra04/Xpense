import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xpense",
  description: "One stop Finance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className}`}>
          <Header />

          <main className="min-h-screen pt-20">{children}</main>
          <Toaster richColors />
          <footer className="bg-blue-50 py-8">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>© 2025 Pratham Chhabra. All rights reserved.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
