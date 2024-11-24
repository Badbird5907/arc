import { type Metadata } from "next";
import type React from "react";
import { FaDiscord, FaYoutube, FaTwitter } from "react-icons/fa";
export type SiteConfig = {
  title: string;
  description: string;
  shortDescription: string;
  nav: {
    title: string;
    link: string;
    checkExact?: boolean;
    className?: string | ((isActive?: boolean) => string);
  }[];
  footer: {
    icons: {
      icon: React.ElementType;
      link: string;
    }[];
  }
} & Metadata;
export const discord = "https://discord.gg/cSEV8EAByx";
export const appConfig: SiteConfig = {
  title: "DufjiSMP",
  description: "Join our Hardcore Minecraft Survival Server, packed with custom features, unique events, and exclusive rewards that take gameplay to the next level!",
  shortDescription: "Hardcore Survival",
  nav: [
    {
      title: "Home",
      link: "/",
      checkExact: true,
    },
    {
      title: "Store",
      link: "/store",
    },
    {
      title: "Discord",
      link: discord,
    },
  ],
  footer: {
    icons: [
      {
        icon: FaYoutube,
        link: "https://www.youtube.com/channel/UC7oMVLCvDrQOJh8b7tmN8cg",
      },
      {
        icon: FaDiscord,
        link: discord,
      },
      {
        icon: FaTwitter,
        link: "https://x.com/RDufji",
      }
    ]
  }
};