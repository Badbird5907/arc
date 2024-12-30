"use client";

import { PlayerSelectForm } from "@/components/player-select-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const PlayerFindClient = () => {
  const [edition, setEdition] = useState<"java" | "bedrock" | null>(null);
  const router = useRouter();
  return (
    <PlayerSelectForm
      editionState={[edition, setEdition]}
      onSelect={(p) => {
        router.push(`/admin/players/find/${p.uuid}`);
      }}
      isOwnAccount={false}
    />
  )
}