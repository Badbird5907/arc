"use client";
import { usePublicSettings } from "@/components/client-config";
import { EditionSelect } from "@/components/header/store/login/edition-select";
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useState } from "react";

export const StoreLoginDialog = () => {
  const { enableBedrock } = usePublicSettings();
  const [stage, setStage] = useState<"edition" | "login">(enableBedrock ? "edition" : "login");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="xl" className="mr-4">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] md:w-[60vw] max-w-full">
        <DialogHeader>
          <DialogTitle>
            {stage == "edition" ? "Select Edition" : "Sign in"}
          </DialogTitle>
        </DialogHeader>
        {stage == "edition" && <EditionSelect />}
      </DialogContent>
    </Dialog>
  )
}