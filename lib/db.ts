import { neon } from "@neondatabase/serverless";
import type { DayItinerary } from "@/types/safaris";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL!);

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
    const result = await sql`
      UPDATE itineraries
      SET 
        name = ${name},
        updated_at = ${now.toISOString()},
        days = ${data.days},
        adults = ${data.adults},
        children = ${data.children},
        profit_amount = ${data.profitAmount},
        is_high_season = ${data.isHighSeason},
        use_manual_vehicles = ${data.useManualVehicles},
        vehicle_count = ${data.vehicleCount},
        itinerary = ${JSON.stringify(data.itinerary)}
      WHERE id = ${existingId}
      RETURNING id, name, created_at, updated_at
    `;

    if (result.length === 0) {
      throw new Error("Itinerary not found");
    }

    const updatedItinerary = result[0];

    return {
      id: updatedItinerary.id.toString(),
      name: updatedItinerary.name,
      createdAt: new Date(updatedItinerary.created_at),
      updatedAt: new Date(updatedItinerary.updated_at),
      data,
    };
  }

  // Otherwise create a new itinerary
  const result = await sql`
    INSERT INTO itineraries (
      name, 
      days, 
      adults, 
      children, 
      profit_amount, 
      is_high_season, 
      use_manual_vehicles, 
      vehicle_count, 
      itinerary
    )
    VALUES (
      ${name},
      ${data.days},
      ${data.adults},
      ${data.children},
      ${data.profitAmount},
      ${data.isHighSeason},
      ${data.useManualVehicles},
      ${data.vehicleCount},
      ${JSON.stringify(data.itinerary)}
    )
    RETURNING id, name, created_at, updated_at
  `;

  const newItinerary = result[0];

  return {
    id: newItinerary.id.toString(),
    name: newItinerary.name,
    createdAt: new Date(newItinerary.created_at),
    updatedAt: new Date(newItinerary.updated_at),
    data,
  };
}

// Get all itineraries
export async function getItineraries(): Promise<SavedItinerary[]> {
  const result = await sql`
    SELECT * FROM itineraries
    ORDER BY updated_at DESC
  `;

  return result.map((row) => ({
    id: row.id.toString(),
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    data: {
      days: row.days,
      adults: row.adults,
      children: row.children,
      profitAmount: Number.parseFloat(row.profit_amount),
      isHighSeason: row.is_high_season,
      useManualVehicles: row.use_manual_vehicles,
      vehicleCount: row.vehicle_count,
      itinerary: row.itinerary,
    },
  }));
}

// Get a specific itinerary by ID
export async function getItineraryById(
  id: string
): Promise<SavedItinerary | null> {
  const result = await sql`
    SELECT * FROM itineraries
    WHERE id = ${id}
  `;

  if (result.length === 0) {
    return null;
  }

  const row = result[0];

  return {
    id: row.id.toString(),
    name: row.name,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    data: {
      days: row.days,
      adults: row.adults,
      children: row.children,
      profitAmount: Number.parseFloat(row.profit_amount),
      isHighSeason: row.is_high_season,
      useManualVehicles: row.use_manual_vehicles,
      vehicleCount: row.vehicle_count,
      itinerary: row.itinerary,
    },
  };
}

// Delete an itinerary
export async function deleteItinerary(id: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM itineraries
    WHERE id = ${id}
    RETURNING id
  `;

  return result.length > 0;
}
