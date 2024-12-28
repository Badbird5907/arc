"use client";

import { PlayerInfo, useCart } from "@/components/cart";
import { usePublicSettings } from "@/components/client-config";
import { DebouncedInput } from "@/components/debounced-input";
import { PlayerSkinImage } from "@/components/player-skin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { useState } from "react";

export const PlayerSelectForm = ({ editionState, onSelect, isOwnAccount }: { editionState: [string | null, React.Dispatch<"java" | "bedrock">]; onSelect: (player: PlayerInfo) => void; isOwnAccount?: boolean }) => {
  const { enableBedrock } = usePublicSettings();
  const [username, setUsername] = useState("");

  const { data: player, isLoading } = api.utils.fetchPlayer.useQuery({ name: username, bedrock: editionState[0] === "bedrock" });
  const valid = (!isLoading && player?.data?.name);
  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-2">
      <div className="w-40 h-35 flex items-start justify-center overflow-hidden place-self-center bg-accent/80 rounded-lg pt-1">
        <PlayerSkinImage
          name={valid ? player.data?.name : "Steve"}
          skinUrl={!valid ? "https://s.namemc.com/i/eb9769cdc0ce3895.png" : undefined}
          renderConfig={{
            name: "ultimate",
            crop: "bust"
          }}
        />
      </div>
      <div className="flex-1 space-y-4 place-self-center w-full">
        {enableBedrock && (
          <Tabs value={editionState[0] ?? "java"} onValueChange={(value) => editionState[1](value as never)} className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="java">Java</TabsTrigger>
              <TabsTrigger value="bedrock">Bedrock</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <DebouncedInput
          defaultValue={username}
          debounceMs={500}
          onDebouncedChange={(value) => setUsername(value)}
          className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400"
          placeholder="Enter your Minecraft username"
        />
        <Button
          className="w-full text-white"
          disabled={!valid}
          loading={isLoading}
          onClick={() => {
            if (!player?.data || player.notFound) return;
            onSelect(player.data);
          }}
        >
          {
            isOwnAccount ? (!valid ? "Could not find your account!" : "Continue") : (
              !valid ? "Could not find that account!" : "Continue"
            )
          }
        </Button>
      </div>
    </div>
  )
}