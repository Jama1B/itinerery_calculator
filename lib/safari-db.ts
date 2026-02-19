
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Place, Activity, Accommodation, RoomType } from "@/types/safaris";
import * as mockData from "./mock-data";

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
  try {
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
  } catch (error) {
    console.error("Error fetching constants from DB, using mock data:", error);
    return mockData.CONSTANTS;
  }
}

// Fetch all places with their activities
export async function getPlaces(): Promise<Place[]> {
  try {
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
  } catch (error) {
    console.error("Error fetching places from DB, using mock data:", error);
    return mockData.PLACES;
  }
}

// Fetch all accommodations with their room types
export async function getAccommodations(): Promise<Accommodation[]> {
  try {
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
  } catch (error) {
    console.error("Error fetching accommodations from DB, using mock data:", error);
    return mockData.ACCOMMODATIONS;
  }
}


// Save or update a place and its activities
export async function savePlace(place: Place) {
  try {
    await sql`BEGIN`;

    await sql`
      INSERT INTO places (id, name, description)
      VALUES (${place.id}, ${place.name}, ${place.description})
      ON CONFLICT (id) DO UPDATE 
      SET name = EXCLUDED.name, description = EXCLUDED.description
    `;

    if (place.activities && place.activities.length > 0) {
      for (const activity of place.activities) {
        await sql`
          INSERT INTO activities (
            id, place_id, name, description, 
            high_season_cost, low_season_cost, 
            child_high_season_cost, child_low_season_cost
          )
          VALUES (
            ${activity.id}, ${place.id}, ${activity.name}, ${activity.description || ""}, 
            ${activity.highSeasonCost || 0}, ${activity.lowSeasonCost || 0}, 
            ${activity.childHighSeasonCost || 0}, ${activity.childLowSeasonCost || 0}
          )
          ON CONFLICT (id) DO UPDATE 
          SET 
            name = EXCLUDED.name, 
            description = EXCLUDED.description,
            high_season_cost = EXCLUDED.high_season_cost,
            low_season_cost = EXCLUDED.low_season_cost,
            child_high_season_cost = EXCLUDED.child_high_season_cost,
            child_low_season_cost = EXCLUDED.child_low_season_cost
        `;
      }
    }

    await sql`COMMIT`;
    return true;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error saving place:", error);
    throw error;
  }
}

// Delete a place and its activities
export async function deletePlace(id: string) {
  try {
    await sql`BEGIN`;
    await sql`DELETE FROM activities WHERE place_id = ${id}`;
    const result = await sql`DELETE FROM places WHERE id = ${id} RETURNING id`;
    await sql`COMMIT`;
    return result.length > 0;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error deleting place:", error);
    throw error;
  }
}

// Save or update an accommodation and its room types
export async function saveAccommodation(acc: Accommodation) {
  try {
    await sql`BEGIN`;

    await sql`
      INSERT INTO accommodations (id, name, description, location, includes_full_board, in_park)
      VALUES (${acc.id}, ${acc.name}, ${acc.description || ""}, ${acc.location ? acc.location.toString() : null}, ${acc.includesFullBoard ?? true}, ${acc.inPark ?? false})
      ON CONFLICT (id) DO UPDATE 
      SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description,
        location = EXCLUDED.location,
        includes_full_board = EXCLUDED.includes_full_board,
        in_park = EXCLUDED.in_park
    `;

    if (acc.roomTypes && acc.roomTypes.length > 0) {
      for (const rt of acc.roomTypes) {
        await sql`
          INSERT INTO room_types (
            id, accommodation_id, name, max_occupancy, 
            high_season_cost, low_season_cost
          )
          VALUES (
            ${rt.id}, ${acc.id}, ${rt.name}, ${rt.maxOccupancy || 1}, 
            ${rt.highSeasonCost || 0}, ${rt.lowSeasonCost || 0}
          )
          ON CONFLICT (id) DO UPDATE 
          SET 
            name = EXCLUDED.name, 
            max_occupancy = EXCLUDED.max_occupancy,
            high_season_cost = EXCLUDED.high_season_cost,
            low_season_cost = EXCLUDED.low_season_cost
        `;
      }
    }

    await sql`COMMIT`;
    return true;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error saving accommodation:", error);
    throw error;
  }
}

// Delete an accommodation and its room types
export async function deleteAccommodation(id: string) {
  try {
    await sql`BEGIN`;
    await sql`DELETE FROM room_types WHERE accommodation_id = ${id}`;
    const result = await sql`DELETE FROM accommodations WHERE id = ${id} RETURNING id`;
    await sql`COMMIT`;
    return result.length > 0;
  } catch (error) {
    await sql`ROLLBACK`;
    console.error("Error deleting accommodation:", error);
    throw error;
  }
}
