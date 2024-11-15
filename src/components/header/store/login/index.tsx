"use client";
import { usePublicSettings } from "@/components/client-config";
import { EditionSelect } from "@/components/header/store/login/edition-select";
import { LoginForm } from "@/components/header/store/login/login-form";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react";

export const StoreLoginDialog = () => {
  const { enableBedrock } = usePublicSettings();
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
        <Button size="xl" className="mr-4">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:w-[25vw] max-w-full">
        <DialogHeader>
          <DialogTitle>
            {stage == "edition" ? "Select Edition" : "Login"}
          </DialogTitle>
        </DialogHeader>
      {stage == "edition" && <EditionSelect onSelect={(edition) => {
        setEdition(edition);
        setStage("login");
      }} />}
      {stage == "login" && edition && <LoginForm editionState={[edition, setEdition]} close={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}