// This is a simple in-memory database for demonstration
// In a real application, you would use a proper database like MongoDB, PostgreSQL, etc.

import type { DayItinerary } from "@/types/safaris";

export interface SavedItinerary {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  data: {
    days: number;
    adults: number;
    children: number;
    profitAmount: number;
    isHighSeason: boolean;
    useManualVehicles: boolean;
    vehicleCount: number;
    itinerary: DayItinerary[];
  };
}

// In-memory database
let savedItineraries: SavedItinerary[] = [];

// Generate a simple ID
const generateId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Save an itinerary
export async function saveItinerary(
  name: string,
  data: {
    days: number;
    adults: number;
    children: number;
    profitAmount: number;
    isHighSeason: boolean;
    useManualVehicles: boolean;
    vehicleCount: number;
    itinerary: DayItinerary[];
  },
  existingId?: string
): Promise<SavedItinerary> {
  const now = new Date();

  // If we have an existing ID, update that itinerary
  if (existingId) {
    const index = savedItineraries.findIndex(
      (itinerary) => itinerary.id === existingId
    );

    if (index !== -1) {
      const updatedItinerary: SavedItinerary = {
        ...savedItineraries[index],
        name,
        updatedAt: now,
        data,
      };

      savedItineraries[index] = updatedItinerary;
      return updatedItinerary;
    }
  }

  // Otherwise create a new itinerary
  const newItinerary: SavedItinerary = {
    id: generateId(),
    name,
    createdAt: now,
    updatedAt: now,
    data,
  };

  savedItineraries.push(newItinerary);
  return newItinerary;
}

// Get all itineraries
export async function getItineraries(): Promise<SavedItinerary[]> {
  return [...savedItineraries].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
}

// Get a specific itinerary by ID
export async function getItineraryById(
  id: string
): Promise<SavedItinerary | null> {
  return savedItineraries.find((itinerary) => itinerary.id === id) || null;
}

// Delete an itinerary
export async function deleteItinerary(id: string): Promise<boolean> {
  const initialLength = savedItineraries.length;
  savedItineraries = savedItineraries.filter(
    (itinerary) => itinerary.id !== id
  );
  return savedItineraries.length < initialLength;
}
