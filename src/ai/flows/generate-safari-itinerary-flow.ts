'use server';
/**
 * @fileOverview A Genkit flow to generate safari itineraries.
 *
 * - generateSafariItinerary - A function that orchestrates the itinerary generation.
 * - GenerateSafariItineraryInput - The input type for the flow.
 * - GenerateSafariItineraryOutput - The return type for the flow.
 */

import {ai} from '@/src/ai/genkit';
import {z}  from 'genkit';
import { getPlaces, getAccommodations } from '@/lib/safari-db'; 

// Define Zod schemas for flow input
const GenerateSafariItineraryInputSchema = z.object({
  durationDays: z.number().min(1).max(30).describe('Duration of the safari in days.'),
  numAdults: z.number().min(1).describe('Number of adults traveling.'),
  numChildren: z.number().min(0).describe('Number of children traveling.'),
  interests: z.string().optional().describe('User interests (e.g., wildlife, photography, adventure, cultural experiences, bird watching).'),
  travelMonth: z.enum([
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]).describe('The month of travel.'),
  budgetLevel: z.enum(["budget", "mid-range", "luxury"]).optional().describe('Preferred budget level for accommodations and activities.'),
  additionalPreferences: z.string().optional().describe('Any other specific preferences or requests from the user.'),
});
export type GenerateSafariItineraryInput = z.infer<typeof GenerateSafariItineraryInputSchema>;

// Define Zod schemas for flow output
const GeneratedPlaceDetailSchema = z.object({
  placeName: z.string().describe("Name of the place to visit, chosen from the provided list of available places."),
  activityNames: z.array(z.string()).describe("List of suggested activity names for this place, chosen from the activities available at that place."),
});

const GeneratedDayItinerarySchema = z.object({
  day: z.number().describe("Day number of the itinerary (e.g., 1, 2, 3)."),
  title: z.string().describe("A short, catchy title for the day's plan (e.g., 'Serengeti Game Drive & Sunset', 'Arrival and Tarangire Exploration')."),
  description: z.string().describe("A brief overview of the day's plan, outlining the main activities and locations."),
  placesToVisit: z.array(GeneratedPlaceDetailSchema).min(1).describe("Places to visit and activities for the day. Must include at least one place unless it's a pure travel/rest day."),
  accommodationName: z.string().optional().describe("Name of the suggested accommodation for the night, chosen from the provided list. Leave empty if it's the departure day or no overnight stay is planned (e.g., flying out late)."),
});

const GenerateSafariItineraryOutputSchema = z.object({
  tripTitle: z.string().describe("A catchy and descriptive title for the overall safari trip (e.g., 'Tanzania Wildlife Adventure', 'Luxury Kenya Safari')."),
  itinerary: z.array(GeneratedDayItinerarySchema).describe("The day-by-day itinerary plan, ensuring the number of days matches the user's requested duration."),
  suggestedSeason: z.enum(["high", "low"]).describe("The determined travel season (high or low) based on the travel month. High season: June-October & December-February. Low season: March-May & November."),
  summary: z.string().describe("A brief summary of the generated trip, highlighting key experiences."),
  notes: z.string().optional().describe("Any additional notes, tips, or suggestions for the user (e.g., packing tips, visa info placeholder)."),
});
export type GenerateSafariItineraryOutput = z.infer<typeof GenerateSafariItineraryOutputSchema>;

// Define the schema for the data to be passed into the prompt template
const PromptInputSchema = GenerateSafariItineraryInputSchema.extend({
  availablePlaces: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    activities: z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
    })),
  })).describe("List of available places with their descriptions and activities."),
  availableAccommodations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    location: z.string().optional(), 
  })).describe("List of available accommodations with their descriptions."),
});

const generateItineraryPrompt = ai.definePrompt({
  name: 'generateSafariItineraryPrompt',
  input: { schema: PromptInputSchema },
  output: { schema: GenerateSafariItineraryOutputSchema },
  prompt: `You are an expert safari planner for East Africa (Tanzania & Kenya). Your goal is to create a personalized and exciting safari itinerary based on the user's preferences and the available options.

User Preferences:
- Duration: {{durationDays}} days
- Adults: {{numAdults}}
- Children: {{numChildren}}
- Interests: {{#if interests}}{{interests}}{{else}}General wildlife viewing{{/if}}
- Travel Month: {{travelMonth}}
- Budget Level: {{#if budgetLevel}}{{budgetLevel}}{{else}}Mid-range{{/if}}
- Additional Preferences: {{#if additionalPreferences}}{{additionalPreferences}}{{else}}None{{/if}}

Determine the travel season based on the travel month.
High Season: June, July, August, September, December, January, February.
Low Season: March, April, May, October, November.
Set the 'suggestedSeason' field in your output accordingly.

Available Places (with their activities):
{{#each availablePlaces}}
- {{name}} (ID: {{id}}): {{description}}
  Activities:
  {{#each activities}}
  - {{name}} (ID: {{id}}): {{description}}
  {{/each}}
{{else}}
No places data provided.
{{/each}}

Available Accommodations:
{{#each availableAccommodations}}
- {{name}} (ID: {{id}}): {{description}}{{#if location}} (Location: {{location}}){{/if}}
{{/each}}

Instructions:
1.  Generate a trip title.
2.  Create a day-by-day itinerary for the specified 'durationDays'. Each day must be an object with 'day', 'title', 'description', 'placesToVisit' (array of places with activities), and 'accommodationName'.
3.  For each day, select appropriate places and activities from the provided lists that match the user's interests and budget. Ensure activities are valid for the chosen place.
4.  Suggest one accommodation per night from the provided list, considering the budget level and location. The last day might not have an accommodation if it's a departure day.
5.  Ensure the number of days in the generated itinerary array matches 'durationDays'.
6.  Provide a brief summary of the trip and any relevant notes.
7.  Structure your entire response STRICTLY according to the output schema. Only include fields defined in the schema.
8.  When listing 'placeName' and 'accommodationName', use the exact names as provided in the 'Available Places' and 'Available Accommodations' lists. For 'activityNames', use the exact names of activities associated with the chosen place.
9.  Be logical about travel. Don't suggest geographically distant places for consecutive days without accounting for travel time (implicitly, by not over-scheduling). Try to create a smooth flow.
10. If a day is primarily for travel or rest, reflect that in the title and description, and you might have fewer activities or just one main place (e.g., arrival city, transfer to next park).
11. Ensure 'placesToVisit' is never empty for any day unless it's explicitly a rest day or a departure day with no activities. Even arrival days should have a destination place.
12. Do not invent new places, activities, or accommodations. Stick to the provided lists.
`,
});

const generateSafariItineraryFlow = ai.defineFlow(
  {
    name: 'generateSafariItineraryFlow',
    inputSchema: PromptInputSchema, // Still using the internal schema object here
    outputSchema: GenerateSafariItineraryOutputSchema, // Still using the internal schema object here
  },
  async (input) => {
    const { output } = await generateItineraryPrompt(input);
    return output!;
  }
);

export async function generateSafariItinerary(details: GenerateSafariItineraryInput): Promise<GenerateSafariItineraryOutput> {
  console.log("Fetching safari data for AI...");
  const [dbPlaces, dbAccommodations] = await Promise.all([
    getPlaces(),
    getAccommodations(),
  ]);
  console.log(`Fetched ${dbPlaces.length} places and ${dbAccommodations.length} accommodations.`);

  const availablePlacesForPrompt = dbPlaces.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    activities: p.activities.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
    })),
  }));

  const availableAccommodationsForPrompt = dbAccommodations.map(acc => ({
    id: acc.id,
    name: acc.name,
    description: acc.description,
    location: acc.location,
  }));

  const flowInput: z.infer<typeof PromptInputSchema> = {
    ...details,
    availablePlaces: availablePlacesForPrompt,
    availableAccommodations: availableAccommodationsForPrompt,
  };

  return generateSafariItineraryFlow(flowInput);
}
