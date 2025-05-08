import { type NextRequest, NextResponse } from "next/server";
import {
  saveItinerary,
  getItineraries,
  getItineraryById,
  deleteItinerary,
} from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, data, id } = body;

    if (!name || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const savedItinerary = await saveItinerary(name, data, id);
    return NextResponse.json(savedItinerary);
  } catch (error) {
    console.error("Error saving itinerary:", error);
    return NextResponse.json(
      { error: "Failed to save itinerary" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const itinerary = await getItineraryById(id);
      if (!itinerary) {
        return NextResponse.json(
          { error: "Itinerary not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(itinerary);
    }

    const itineraries = await getItineraries();
    return NextResponse.json(itineraries);
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json(
      { error: "Failed to fetch itineraries" },
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
        { error: "Missing itinerary ID" },
        { status: 400 }
      );
    }

    const success = await deleteItinerary(id);
    if (!success) {
      return NextResponse.json(
        { error: "Itinerary not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    return NextResponse.json(
      { error: "Failed to delete itinerary" },
      { status: 500 }
    );
  }
}
