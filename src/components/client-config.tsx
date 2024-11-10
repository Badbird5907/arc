"use client";
import { type SettingKey, type SettingType } from "@/types/settings";
import React from "react";

export const PublicSettingsContext = React.createContext<Record<SettingKey, SettingType[keyof SettingType]>>({} as Record<SettingKey, SettingType[keyof SettingType]>);

export const usePublicSettings = () => React.useContext(PublicSettingsContext);

export const PublicSettingsProvider = ({ children, settings }: { children: React.ReactNode, settings: Record<SettingKey, SettingType[keyof SettingType]> }) => {
  return (
    <PublicSettingsContext.Provider value={settings}>
      {children}
    </PublicSettingsContext.Provider>
  );
}