"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { SavedItinerary } from "@/lib/db";
import { Trash2, FileEdit, Calendar, Users, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface LoadItineraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoad: (itinerary: SavedItinerary) => void;
  onDelete: (id: string) => Promise<void>;
}

export function LoadItineraryDialog({
  open,
  onOpenChange,
  onLoad,
  onDelete,
}: LoadItineraryDialogProps) {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchItineraries();
    }
  }, [open]);

  const fetchItineraries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/itinerary");
      if (!response.ok) throw new Error("Failed to fetch itineraries");
      const data = await response.json();
      setItineraries(data);
    } catch (error) {
      console.error("Error fetching itineraries:", error);
      toast({
        title: "Error",
        description: "Failed to load saved itineraries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this itinerary?")) {
      setIsDeleting(id);
      try {
        await onDelete(id);
        setItineraries((prev) =>
          prev.filter((itinerary) => itinerary.id !== id)
        );
        toast({
          title: "Itinerary deleted",
          description: "The itinerary has been deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting itinerary:", error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the itinerary",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Load Saved Itinerary</DialogTitle>
          <DialogDescription>
            Select a previously saved safari itinerary to load
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Loading saved itineraries...</div>
        ) : itineraries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No saved itineraries found. Create and save an itinerary first.
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <Card
                  key={itinerary.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => {
                    onLoad(itinerary);
                    onOpenChange(false);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg flex items-center gap-2">
                          <FileEdit className="h-4 w-4" />
                          {itinerary.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Updated {formatDate(itinerary.updatedAt)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDelete(itinerary.id, e)}
                        disabled={isDeleting === itinerary.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{itinerary.data.days} days</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>
                          {itinerary.data.adults} adults,{" "}
                          {itinerary.data.children} children
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>${itinerary.data.profitAmount} profit</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
