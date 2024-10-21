import { type Metadata } from "next";

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
};