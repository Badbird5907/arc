"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/trpc/react";
import { type SettingType, type SettingWithValue } from "@/types/settings";
import { useState } from "react";
import { toast } from "sonner";

export const SettingsCard = ({ setting }: { setting: SettingWithValue<keyof SettingType> }) => {
  const [value, _setValue] = useState<SettingType[typeof setting["type"]]>(setting.value ?? setting.defaultValue);
  const [isDirty, setIsDirty] = useState(false);
  const setValue = (value: SettingType[typeof setting["type"]]) => {
    _setValue(value);
    setIsDirty(true);
  } 
  const modifySetting = api.settings.modifySetting.useMutation();
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>
          {setting.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="">
        {setting.description && (
          <p className="text-sm text-accent-foreground pb-2">
            {setting.description}
          </p>
        )}
        {setting.type === "boolean" && (
          <Select defaultValue={value ? "true" : "false"} onValueChange={(value) => setValue(value === "true")}>
            <SelectTrigger>
              <SelectValue placeholder={"Value"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">
                True
              </SelectItem>
              <SelectItem value="false">
                False
              </SelectItem>
            </SelectContent>
          </Select>
        )}
        {setting.type === "string" && (
          <Input value={value as string} onChange={(e) => setValue(e.target.value)} />
        )}
        {setting.type === "number" && (
          <Input value={value as number} onChange={(e) => setValue(Number(e.target.value))} type="number" />
        )}
        <p className="text-xs text-accent-foreground/50">Default: {String(setting.defaultValue)}</p>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button onClick={() => {
          console.log(`Setting value of ${setting.key} to ${value}`);
          modifySetting.mutateAsync({ key: setting.key, value })
          .then(() => {
            toast.success(`Setting ${setting.name} saved`);
            setIsDirty(false);
          }).catch((e) => {
            toast.error(`Failed to save setting: ${e instanceof Error ? e.message : "Unknown error"}`);
            console.error(e);
          });
        }} disabled={!isDirty} className="w-full" loading={modifySetting.isPending}>
          Save
        </Button>
      </CardFooter>
    </Card>
  )
}