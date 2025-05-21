"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlacesManager } from "@/components/admin/places-manager";
import { AccommodationsManager } from "@/components/admin/accommodations-manager";
import { AdminHeader } from "@/components/admin/admin-header";

export default function AdminPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <AdminHeader />

      <Tabs defaultValue="places" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="places">Places & Activities</TabsTrigger>
          <TabsTrigger value="accommodations">
            Accommodations & Rooms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="places" className="space-y-4">
          <PlacesManager
            places={[]}
            onPlacesChange={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </TabsContent>

        <TabsContent value="accommodations" className="space-y-4">
          <AccommodationsManager
            accommodations={[]}
            onAccommodationsChange={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
