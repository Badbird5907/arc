"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";

export const EditNotes = ({ id, content }: { id: string, content: string }) => {
  const [notes, setNotes] = useState(content);
  const updateNotes = api.orders.updateNotes.useMutation();
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button onClick={() => {
          updateNotes.mutateAsync({ id, notes }).then(() => {
            toast.success("Notes updated!");
          });
        }} loading={updateNotes.isPending} className="w-full">
          Save
        </Button>
      </CardContent>
    </Card>
  )
}