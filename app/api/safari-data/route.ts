import { NextResponse } from "next/server";
import { getPlaces, getAccommodations, getConstants } from "@/lib/safari-db";

export async function GET() {
  try {
    const [places, accommodations, constants] = await Promise.all([
      getPlaces(),
      getAccommodations(),
      getConstants(),
    ]);

    return NextResponse.json({
      places,
      accommodations,
      constants,
    });
  } catch (error) {
    console.error("Error fetching safari data:", error);
    return NextResponse.json(
      { error: "Failed to fetch safari data" },
      { status: 500 }
    );
  }
}
