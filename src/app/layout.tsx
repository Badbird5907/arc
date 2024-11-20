import "@/styles/globals.css";

import { type Metadata } from "next";
import { Poppins } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { appConfig } from "@/app/app-config";
import { Toaster } from "@/components/ui/sonner";
import { getPublicSettings } from "@/server/settings";
import { PublicSettingsProvider } from "@/components/client-config";

export const metadata: Metadata = {
  title: appConfig.title,
  description: appConfig.shortDescription,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  other: {
    "darkreader-lock": "f"
  }
};

const poppins = Poppins({ subsets: ["latin"], weight: "700" });

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const publicSettings = await getPublicSettings();
  return (
    <html lang="en" className={`${poppins.className}`}>
      <body className="dark">
        <PublicSettingsProvider settings={publicSettings}>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </PublicSettingsProvider>
      </body>
    </html>
  );
}
