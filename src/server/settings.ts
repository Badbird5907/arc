import "server-only";

import { db } from "@/server/db";
import { settings } from "@/server/db/schema";
import { allSettings, dbToSetting, type Setting, settingsRegistry, publicSettings, type SettingType, type SettingWithValue, type SettingKey } from "@/types/settings";
import { del, get, set } from "@/server/redis";
import { inArray } from "drizzle-orm";

export const getAllSettings = async (): Promise<Record<string, SettingWithValue<keyof SettingType>>> => {
  const dbSettings = await db.query.settings.findMany();
  const settings: Record<string, SettingWithValue<keyof SettingType>> = {
    ...Object.values(settingsRegistry).reduce(
      (acc: Record<string, SettingWithValue<keyof SettingType>>, setting: Setting<keyof SettingType>) => {
        acc[setting.key] = { ...setting, value: undefined };
        return acc;
      },
      {} as Record<string, SettingWithValue<keyof SettingType>>
    ),
    ...dbSettings.reduce((acc, setting) => {
      acc[setting.key] = dbToSetting(setting.key as SettingKey, setting);
      return acc;
    }, {} as Record<string, SettingWithValue<keyof SettingType>>)
  };
  return settings; 
}

export const setSetting = async <T extends keyof SettingType>(key: SettingKey, value: SettingType[T]) => {
  const setting = settingsRegistry[key] as Setting<T>;
  if (!setting) {
    throw new Error(`Unknown setting: ${key}`);
  }
  // check if value is valid
  if (setting.type === "boolean" && typeof value !== "boolean") {
    throw new Error(`Expected boolean for setting ${key}`);
  }
  if (setting.type === "string" && typeof value !== "string") {
    throw new Error(`Expected string for setting ${key}`);
  }
  if (setting.type === "number" && typeof value !== "number") {
    throw new Error(`Expected number for setting ${key}`);
  }
  const jsonValue = JSON.stringify(value);
  await db.insert(settings).values({
    key,
    value: jsonValue,
  }).onConflictDoUpdate({
    target: settings.key,
    set: { value: jsonValue },
  }).then(async () => {
    // revalidateTag("settings")
    await Promise.all([
      del(`settings:${key}`),
      del("public_settings"),
    ]);
  })
}

export const getSetting = async <T>(
  key: SettingKey
): Promise<SettingWithValue<T>> => {
  const cached = await get<SettingWithValue<T>>(`settings:${key}`);
  if (cached) {
    return cached;
  }
  const dbSetting = await db.query.settings.findFirst({
    where: (s, { eq }) => eq(s.key, key)
  });
  const result = dbToSetting<T>(key, dbSetting); // fuck it
  if (result) {
    await set(`settings:${key}`, result);
  }
  return result;
};

export const getPublicSettings = async (): Promise<Record<typeof publicSettings[number], SettingType[keyof SettingType]>> => {
  const cached = await get<Record<string, SettingType[keyof SettingType]>>("public_settings");
  if (cached) {
    return cached;
  }
  const result = await db.select().from(settings)
    .where(inArray(settings.key, publicSettings));
  console.log(result);
  let resultSettings = result.reduce<Record<string, SettingType[keyof SettingType]>>((acc, setting: { key: string; value: string }) => {
    acc[setting.key] = JSON.parse(setting.value) as SettingType[keyof SettingType];
    return acc;
  }, {} as Record<string, SettingType[keyof SettingType]>);

  const missingSettings: string[] = publicSettings.filter((key) => !resultSettings[key]);
  if (missingSettings.length > 0) {
    // fill in with defaults
    const defaultSettings = allSettings.filter((setting: Setting) => missingSettings.includes(setting.key));
    resultSettings = {
      ...resultSettings,
      ...defaultSettings.reduce((acc, setting) => {
        acc[setting.key] = setting.defaultValue;
        return acc;
      }, {} as Record<string, SettingType[keyof SettingType]>)
    }
  }
  await set("public_settings", resultSettings);
  return resultSettings;
}