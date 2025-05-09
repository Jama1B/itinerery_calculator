import { type NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Initialize the Neon client
const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Get all places with their activities
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

    // Map activities to their places
    const places = placesResult.map((place) => {
      const placeActivities = activitiesResult
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

    return NextResponse.json(places);
  } catch (error) {
    console.error("Error fetching places:", error);
    return NextResponse.json(
      { error: "Failed to fetch places" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, activities } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Start a transaction
    await sql`BEGIN`;

    try {
      // Insert or update the place
      await sql`
        INSERT INTO places (id, name, description)
        VALUES (${id}, ${name}, ${description})
        ON CONFLICT (id) DO UPDATE 
        SET name = EXCLUDED.name, description = EXCLUDED.description
      `;

      // Handle activities if provided
      if (activities && activities.length > 0) {
        // For each activity
        for (const activity of activities) {
          if (!activity.id || !activity.name) {
            throw new Error("Activity missing required fields");
          }

          await sql`
            INSERT INTO activities (
              id, 
              place_id, 
              name, 
              description, 
              high_season_cost, 
              low_season_cost, 
              child_high_season_cost, 
              child_low_season_cost
            )
            VALUES (
              ${activity.id}, 
              ${id}, 
              ${activity.name}, 
              ${activity.description || ""}, 
              ${activity.highSeasonCost || 0}, 
              ${activity.lowSeasonCost || 0}, 
              ${activity.childHighSeasonCost || 0}, 
              ${activity.childLowSeasonCost || 0}
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

      // Commit the transaction
      await sql`COMMIT`;

      return NextResponse.json({ success: true, id });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error saving place:", error);
    return NextResponse.json(
      { error: "Failed to save place" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing place ID" }, { status: 400 });
    }

    // Start a transaction
    await sql`BEGIN`;

    try {
      // Delete associated activities first
      await sql`DELETE FROM activities WHERE place_id = ${id}`;

      // Then delete the place
      const result =
        await sql`DELETE FROM places WHERE id = ${id} RETURNING id`;

      // Commit the transaction
      await sql`COMMIT`;

      if (result.length === 0) {
        return NextResponse.json({ error: "Place not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      // Rollback on error
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error("Error deleting place:", error);
    return NextResponse.json(
      { error: "Failed to delete place" },
      { status: 500 }
    );
  }
}
