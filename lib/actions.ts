"use server";

import {
    getPlaces,
    getAccommodations,
    getConstants,
    savePlace as dbSavePlace,
    deletePlace as dbDeletePlace,
    saveAccommodation as dbSaveAccommodation,
    deleteAccommodation as dbDeleteAccommodation
} from "./safari-db";
import {
    saveItinerary as dbSaveItinerary,
    deleteItinerary as dbDeleteItinerary,
    getItineraries as dbGetItineraries,
    getItineraryById as dbGetItineraryById
} from "./db";
import type { SavedItinerary } from "./db";
import type { Place, Accommodation } from "@/types/safaris";

/**
 * Fetches all safari data with caching enabled.
 * Using 'use cache' directive for Next.js 16 performance.
 */
export async function getSafariData() {
    "use cache";

    const [places, accommodations, constants] = await Promise.all([
        getPlaces(),
        getAccommodations(),
        getConstants(),
    ]);

    return {
        places,
        accommodations,
        constants,
    };
}

/**
 * Server Action to save or update an itinerary.
 */
export async function saveItineraryAction(
    name: string,
    data: any,
    existingId?: string
): Promise<SavedItinerary> {
    const result = await dbSaveItinerary(name, data, existingId);
    return result;
}

/**
 * Server Action to delete an itinerary.
 */
export async function deleteItineraryAction(id: string): Promise<boolean> {
    const result = await dbDeleteItinerary(id);
    return result;
}

/**
 * Fetches all itineraries.
 */
export async function getItinerariesAction(): Promise<SavedItinerary[]> {
    return await dbGetItineraries();
}

/**
 * Server Action to fetch all places.
 */
export async function getPlacesAction(): Promise<Place[]> {
    return await getPlaces();
}

/**
 * Server Action to fetch all accommodations.
 */
export async function getAccommodationsAction(): Promise<Accommodation[]> {
    return await getAccommodations();
}

/**
 * Fetches an itinerary by ID.
 */
export async function getItineraryByIdAction(id: string): Promise<SavedItinerary | null> {
    return await dbGetItineraryById(id);
}

/**
 * Server Action to save or update a place.
 */
export async function savePlaceAction(place: Place) {
    return await dbSavePlace(place);
}

/**
 * Server Action to delete a place.
 */
export async function deletePlaceAction(id: string) {
    return await dbDeletePlace(id);
}

/**
 * Server Action to save or update an accommodation.
 */
export async function saveAccommodationAction(acc: Accommodation) {
    return await dbSaveAccommodation(acc);
}

/**
 * Server Action to delete an accommodation.
 */
export async function deleteAccommodationAction(id: string) {
    return await dbDeleteAccommodation(id);
}
