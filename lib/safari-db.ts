
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Place, Activity, Accommodation, RoomType } from "@/types/safaris";

let sql: NeonQueryFunction<false, false>;

const DATABASE_URL_ENV = process.env.DATABASE_URL;

if (!DATABASE_URL_ENV) {
  console.error(
    "WARNING: DATABASE_URL environment variable is not set. " +
    "Database functionalities will be unavailable. Ensure DATABASE_URL is configured in your .env file."
  );
  // Assign a mock function that throws if called, to allow module loading and type checking.
  sql = (() => {
    throw new Error(
      "Database connection is not initialized because DATABASE_URL is missing."
    );
  }) as any; // Use 'as any' as it's a development-time safeguard.
} else {
  // Initialize the Neon client if DATABASE_URL is present
  sql = neon(DATABASE_URL_ENV);
}

// Fetch constants from the database
export async function getConstants() {
  // The check for sql's validity is now implicit:
  // if it wasn't initialized properly (due to missing DATABASE_URL),
  // calling it will throw the error defined above.
  const result = await sql`
    SELECT id, value FROM constants
  `;

  const constantsData: Record<string, number> = {};
  result.forEach((row) => {
    constantsData[row.id] = Number(row.value);
  });

  return {
    CONCESSION_FEE: constantsData.concession_fee || 59,
    CHILD_CONCESSION_FEE: constantsData.child_concession_fee || 11.8,
    VEHICLE_CAPACITY: constantsData.vehicle_capacity || 7,
  };
}

// Fetch all places with their activities
export async function getPlaces(): Promise<Place[]> {
  const placesResult = await sql`
    SELECT id, name, description FROM places
  `;

  const activitiesResult = await sql`
    SELECT 
      id, 
      place_id, 
      name, 
      description, 
      high_season_cost, 
      low_season_cost, 
      child_high_season_cost, 
      child_low_season_cost 
    FROM activities
  `;

  const placesData: Place[] = placesResult.map((place) => {
    const placeActivities: Activity[] = activitiesResult
      .filter((activity) => activity.place_id === place.id)
      .map((activity) => ({
        id: activity.id,
        name: activity.name,
        description: activity.description,
        highSeasonCost: Number(activity.high_season_cost),
        lowSeasonCost: Number(activity.low_season_cost),
        childHighSeasonCost: Number(activity.child_high_season_cost),
        childLowSeasonCost: Number(activity.child_low_season_cost),
      }));

    return {
      id: place.id,
      name: place.name,
      description: place.description,
      activities: placeActivities,
    };
  });

  return placesData;
}

// Fetch all accommodations with their room types
export async function getAccommodations(): Promise<Accommodation[]> {
  const accommodationsResult = await sql`
    SELECT 
      id, 
      name, 
      description, 
      location, 
      includes_full_board, 
      in_park 
    FROM accommodations
  `;

  const roomTypesResult = await sql`
    SELECT 
      id, 
      accommodation_id, 
      name, 
      max_occupancy, 
      high_season_cost, 
      low_season_cost 
    FROM room_types
  `;

  const accommodationsData: Accommodation[] = accommodationsResult.map(
    (accommodation) => {
      const accommodationRoomTypes: RoomType[] = roomTypesResult
        .filter((roomType) => roomType.accommodation_id === accommodation.id)
        .map((roomType) => ({
          id: roomType.id,
          name: roomType.name,
          maxOccupancy: roomType.max_occupancy,
          highSeasonCost: Number(roomType.high_season_cost),
          lowSeasonCost: Number(roomType.low_season_cost),
        }));

      return {
        id: accommodation.id,
        name: accommodation.name,
        description: accommodation.description,
        location: accommodation.location, // This should be string | null based on schema
        includesFullBoard: accommodation.includes_full_board,
        inPark: accommodation.in_park,
        roomTypes: accommodationRoomTypes,
      };
    }
  );

  return accommodationsData;
}
