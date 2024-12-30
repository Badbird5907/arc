import { type Metadata } from "next";
import type React from "react";
import { FaDiscord, FaYoutube, FaTwitter, FaStore, FaHome } from "react-icons/fa";
export type SiteConfig = {
  title: string;
  description: string;
  shortDescription: string;
  logo?: string | null;
  nav: {
    title: string;
    link: string;
    checkExact?: boolean;
    className?: string | ((isActive?: boolean) => string);
    icon?: React.ElementType;
  }[];
  footer: {
    icons: {
      icon: React.ElementType;
      link: string;
    }[];
  }
} & Metadata;
export const discord = "https://discord.badbird.dev/";
export const appConfig: SiteConfig = {
  title: "Arc",
  description: "Arc is a Minecraft Server webstore made in Next.js, Supabase, and Drizzle.",
  shortDescription: "Fully customisable Minecraft Server Webstore",
  logo: null,
  nav: [
    {
      title: "Home",
      link: "/",
      checkExact: true,
      icon: FaHome,
    },
    {
      title: "Store",
      link: "/store",
      icon: FaStore,
    },
    {
      title: "Discord",
      link: discord,
      icon: FaDiscord,
    },
  ],
  footer: {
    icons: [
      {
        icon: FaYoutube,
        link: "https://www.youtube.com/@badbird5907",
      },
      {
        icon: FaDiscord,
        link: discord,
      },
      {
        icon: FaTwitter,
        link: "https://x.com/badbird_5907",
      }
    ]
  }
};