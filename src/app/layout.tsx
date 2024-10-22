import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { appConfig } from "@/app/app-config";

export const metadata: Metadata = {
  title: appConfig.title,
  description: appConfig.shortDescription,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const poppins = Poppins({ subsets: ["latin"], weight: "700" });

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.className}`}>
      <body className="dark">
        <TRPCReactProvider>
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
