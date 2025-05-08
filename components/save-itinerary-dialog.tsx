"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { SavedItinerary } from "@/lib/db";

interface SaveItineraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void>;
  currentItinerary: SavedItinerary | null;
}

export function SaveItineraryDialog({
  open,
  onOpenChange,
  onSave,
  currentItinerary,
}: SaveItineraryDialogProps) {
  const [name, setName] = useState(currentItinerary?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your itinerary",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(name);
      toast({
        title: "Itinerary saved",
        description: "Your safari itinerary has been saved successfully",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving itinerary:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your itinerary",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currentItinerary ? "Update Itinerary" : "Save Itinerary"}
          </DialogTitle>
          <DialogDescription>
            {currentItinerary
              ? "Update your saved safari itinerary with the current changes."
              : "Save your safari itinerary to access it later."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="itinerary-name" className="text-right">
              Name
            </Label>
            <Input
              id="itinerary-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="My Safari Itinerary"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : currentItinerary ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
