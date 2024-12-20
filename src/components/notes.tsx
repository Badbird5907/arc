"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export const EditNotes = ({ content, updateNotes }: { content: string, updateNotes: (notes: string) => Promise<unknown> }) => {
  const [notes, setNotes] = useState(content);
  const [isPending, beginTransition] = useTransition();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={() => {
          beginTransition(async () => {
            await updateNotes(notes).then(() => {
              toast.success("Notes updated!");
            }).catch((error) => {
              toast.error("Failed to update notes", { description: error.message });
            });
          });
        }} className="w-full" loading={isPending}>
          Save
        </Button>
      </CardContent>
    </Card>
  )
}