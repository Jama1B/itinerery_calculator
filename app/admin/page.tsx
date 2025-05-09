"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { PlacesManager } from "@/components/admin/places-manager";
import { AccommodationsManager } from "@/components/admin/accommodations-manager";
import type { Place, Accommodation } from "@/types/safaris";

export default function AdminPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [isLoadingAccommodations, setIsLoadingAccommodations] = useState(true);
  const { toast } = useToast();

  // Fetch places
  const fetchPlaces = async () => {
    setIsLoadingPlaces(true);
    try {
      const response = await fetch("/api/places");
      if (!response.ok) throw new Error("Failed to fetch places");
      const data = await response.json();
      setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
      toast({
        title: "Error",
        description: "Failed to load places",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  // Fetch accommodations
  const fetchAccommodations = async () => {
    setIsLoadingAccommodations(true);
    try {
      const response = await fetch("/api/accommodations");
      if (!response.ok) throw new Error("Failed to fetch accommodations");
      const data = await response.json();
      setAccommodations(data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
      toast({
        title: "Error",
        description: "Failed to load accommodations",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAccommodations(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPlaces();
    fetchAccommodations();
  }, []);

  return (
    <div className="container mx-auto py-6 max-w-6xl space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">
          Safari Data Management
        </h1>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Back to Calculator
        </Button>
      </div>

      <Tabs defaultValue="places" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="places">Places & Activities</TabsTrigger>
          <TabsTrigger value="accommodations">Accommodations</TabsTrigger>
        </TabsList>

        <TabsContent value="places">
          <Card>
            <CardHeader>
              <CardTitle>Manage Places and Activities</CardTitle>
              <CardDescription>
                Add, edit, or remove places and their associated activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlaces ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : (
                <PlacesManager places={places} onPlacesChange={fetchPlaces} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accommodations">
          <Card>
            <CardHeader>
              <CardTitle>Manage Accommodations</CardTitle>
              <CardDescription>
                Add, edit, or remove accommodations and their room types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAccommodations ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
              ) : (
                <AccommodationsManager
                  accommodations={accommodations}
                  onAccommodationsChange={fetchAccommodations}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
