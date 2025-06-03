
import { neon } from "@neondatabase/serverless";
import type { Place, Activity, Accommodation, RoomType } from "@/types/safaris";

const DATABASE_URL_ENV = process.env.DATABASE_URL;

if (!DATABASE_URL_ENV) {
  // This error will be thrown when the module is loaded if DATABASE_URL is not set.
  // This will cause the server to fail to handle requests to /api/safari-data correctly.
  // The API route will catch this during its import of getPlaces/getAccommodations/getConstants.
  throw new Error(
    "FATAL: DATABASE_URL environment variable is not set. " +
    "Please ensure DATABASE_URL is correctly configured in your .env file for the application to connect to the database."
  );
}

// Initialize the Neon client
const sql = neon(DATABASE_URL_ENV);

// Fetch constants from the database
export async function getConstants() {
  const result = await sql`
    SELECT id, value FROM constants
  `;

  const constantsData: Record<string, number> = {};
  result.forEach((row) => {
    constantsData[row.id] = Number(row.value);
  });

  return {
    CONCESSION_FEE: constantsData.concession_fee || 60,
    CHILD_CONCESSION_FEE: constantsData.child_concession_fee || 30,
    VEHICLE_CAPACITY: constantsData.vehicle_capacity || 7,
  };
}

// Fetch all places with their activities
export async function getPlaces(): Promise<Place[]> {
  // First, get all places
  const placesResult = await sql`
    SELECT id, name, description FROM places
  `;

  // Then, get all activities
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

  // Map activities to their places
  const places: Place[] = placesResult.map((place) => {
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

  return places;
}

// Fetch all accommodations with their room types
export async function getAccommodations(): Promise<Accommodation[]> {
  // First, get all accommodations
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

  // Then, get all room types
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

  // Map room types to their accommodations
  const accommodations: Accommodation[] = accommodationsResult.map(
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
        location: accommodation.location,
        includesFullBoard: accommodation.includes_full_board,
        inPark: accommodation.in_park,
        roomTypes: accommodationRoomTypes,
      };
    }
  );

  return accommodations;
}
