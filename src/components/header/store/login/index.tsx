"use client";
import { useCart } from "@/components/cart";
import { usePublicSettings } from "@/components/client-config";
import { EditionSelect } from "@/components/header/store/login/edition-select";
import { PlayerSelectForm } from "@/components/player-select-form";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils";
import { useState } from "react";

export const StoreLoginDialog = ({ mr }: { mr?: boolean }) => {
  const { enableBedrock } = usePublicSettings();
  const setPlayer = useCart((state) => state.setPlayer);
  const [edition, setEdition] = useState<"java" | "bedrock" | null>(!enableBedrock ? "java" : null);
  const [stage, setStage] = useState<"edition" | "login">(enableBedrock ? "edition" : "login");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setEdition(!enableBedrock ? "java" : null);
        setStage(enableBedrock ? "edition" : "login");
      }}
    >
      <DialogTrigger asChild>
        <Button size="xl" className={cn(mr ? "mr-4" : "")}>
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:w-[30vw] min-w-fit max-w-full">
        <DialogHeader>
          <DialogTitle>
            {stage == "edition" ? "Select Edition" : "Login"}
          </DialogTitle>
        </DialogHeader>
        {stage == "edition" && <EditionSelect onSelect={(edition) => {
          setEdition(edition);
          setStage("login");
        }} />}
        {stage == "login" && edition && <PlayerSelectForm editionState={[edition, setEdition]} onSelect={(player) => {
          setPlayer(player);
          setOpen(false);
        }} checkBanned />}
      </DialogContent>
    </Dialog>
  )
}