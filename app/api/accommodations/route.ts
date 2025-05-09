import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get all accommodations with their room types
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

    // Map room types to their accommodations
    const accommodations = accommodationsResult.map((accommodation) => {
      const accommodationRoomTypes = roomTypesResult
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
    });

    return NextResponse.json(accommodations);
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    return NextResponse.json(
      { error: "Failed to fetch accommodations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      location,
      includesFullBoard,
      inPark,
      roomTypes,
    } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start a transaction
    await sql`BEGIN`;

    try {
      // Insert or update the accommodation
      await sql`
        INSERT INTO accommodations (id, name, description, location, includes_full_board, in_park)
        VALUES (${id}, ${name}, ${description || ""}, ${location || null}, ${
        includesFullBoard || true
      }, ${inPark || false})
        ON CONFLICT (id) DO UPDATE 
        SET 
          name = EXCLUDED.name, 
          description = EXCLUDED.description,
          location = EXCLUDED.location,
          includes_full_board = EXCLUDED.includes_full_board,
          in_park = EXCLUDED.in_park
      `;

      // Handle room types if provided
      if (roomTypes && roomTypes.length > 0) {
        // For each room type
        for (const roomType of roomTypes) {
          if (!roomType.id || !roomType.name) {
            throw new Error("Room type missing required fields");
          }

          await sql`
            INSERT INTO room_types (
              id, 
              accommodation_id, 
              name, 
              max_occupancy, 
              high_season_cost, 
              low_season_cost
            )
            VALUES (
              ${roomType.id}, 
              ${id}, 
              ${roomType.name}, 
              ${roomType.maxOccupancy || 1}, 
              ${roomType.highSeasonCost || 0}, 
              ${roomType.lowSeasonCost || 0}
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

      // Commit the transaction
      await sql`COMMIT`;

      return NextResponse.json({ success: true, id });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error saving accommodation:", error);
    return NextResponse.json(
      { error: "Failed to save accommodation" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing accommodation ID" },
        { status: 400 }
      );
    }

    // Start a transaction
    await sql`BEGIN`;

    try {
      // Delete associated room types first
      await sql`DELETE FROM room_types WHERE accommodation_id = ${id}`;

      // Then delete the accommodation
      const result =
        await sql`DELETE FROM accommodations WHERE id = ${id} RETURNING id`;

      // Commit the transaction
      await sql`COMMIT`;

      if (result.length === 0) {
        return NextResponse.json(
          { error: "Accommodation not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error deleting accommodation:", error);
    return NextResponse.json(
      { error: "Failed to delete accommodation" },
      { status: 500 }
    );
  }
}
