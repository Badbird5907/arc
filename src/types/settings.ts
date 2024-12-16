export type SettingType = {
  boolean: boolean;
  string: string;
  number: number;
};

export type Setting<T extends keyof SettingType = keyof SettingType> = {
  key: string;
  name: string;
  description: string | undefined;
  defaultValue: SettingType[T];
  type: T;
  role?: string;
};

export type SettingWithValue<T> = Setting & {
  value: T | undefined;
};


export const allSettings = [
  {
    key: "enableBedrock",
    name: "Enable Bedrock",
    description: "Enable Bedrock Edition support",
    defaultValue: false,
    type: "boolean",
  },
  {
    key: "discordWebhook",
    name: "Discord Webhook",
    description: "The Discord webhook to send notifications to",
    defaultValue: "",
    type: "string",
  },
  { // this is here so the types still work. We can remove it once there is a proper number setting
    key: "dummyNumber",
    name: "Dummy Number",
    description: "A dummy number setting",
    defaultValue: 42,
    type: "number",
  }
] as const;
export type SettingKey = typeof allSettings[number]["key"];

export const settingsRegistry: Record<SettingKey, Setting<keyof SettingType>> = allSettings.reduce((acc, setting) => {
  acc[setting.key] = setting;
  return acc;
}, {} as Record<string, Setting<keyof SettingType>>);


export const dbToSetting = <T>(key: SettingKey, dbSetting?: { key: string; value: string }): SettingWithValue<T> => {
  const setting = settingsRegistry[key];
  if (!setting) {
    throw new Error(`Unknown setting: ${key}`);
  }
  return {
    ...setting,
    key: key,
    value: dbSetting?.value ? JSON.parse(dbSetting.value) as T : setting.defaultValue,
  } as SettingWithValue<T>;
}


export const publicSettings: SettingKey[] = [
  "enableBedrock"
] as const