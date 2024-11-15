"use client";

import { useCart } from "@/components/cart";
import { DebouncedInput } from "@/components/debounced-input";
import { PlayerSkinImage } from "@/components/player-skin";
import { Button } from "@/components/ui/button";
import { Tabs, TabsTrigger, TabsList } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { useState } from "react";

export const LoginForm = ({ editionState, close }: { editionState: [string | null, React.Dispatch<"java" | "bedrock">]; close: () => void }) => {
  const [username, setUsername] = useState("");

  const setPlayer = useCart((state) => state.setPlayer)
  const { data: player, isLoading } = api.utils.fetchPlayer.useQuery({ name: username, bedrock: editionState[0] === "bedrock" });
  const valid = (!isLoading && player && !player.notFound && 'name' in player);
  return (
    <div className="flex flex-col md:flex-row items-start gap-6 p-2">
      <div className="w-40 h-35 flex items-start justify-center overflow-hidden place-self-center bg-accent/80 rounded-lg pt-1">
        <PlayerSkinImage
          name={valid ? player.name : "Steve"}
          skinUrl={!valid ? "https://s.namemc.com/i/eb9769cdc0ce3895.png" : undefined}
          renderConfig={{
            name: "ultimate",
            crop: "bust"
          }}
        />
      </div>
      <div className="flex-1 space-y-4 place-self-center w-full">
        <Tabs value={editionState[0] ?? "java"} onValueChange={(value) => editionState[1](value as never)} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="java">Java</TabsTrigger>
            <TabsTrigger value="bedrock">Bedrock</TabsTrigger>
          </TabsList>
        </Tabs>
        <DebouncedInput
          defaultValue={username}
          debounceMs={500}
          onDebouncedChange={(value) => setUsername(value)}
          className="bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-400"
          placeholder="Enter your Minecraft username"
        />
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          disabled={!username || isLoading || player?.notFound}
          loading={isLoading}
          onClick={() => {
            if (!player || player.notFound || !("uuid" in player)) return;
            setPlayer(player)
            close();
          }}
        >
          {player?.notFound && username ? "Could not find your account!" : "Continue"}
        </Button>
      </div>
    </div>
  )
}