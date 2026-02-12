import { Accommodation, Place } from "@/types/safaris";

const calculatePercentage = (val: string) => {
    if (val.includes("+")) {
        const parts = val.split("+");
        const base = parseFloat(parts[0]);
        const percentage = parseFloat(parts[1].replace("%", ""));
        return base + (base * percentage) / 100;
    }
    return parseFloat(val);
};

// Sample data
export const PLACES: Place[] = [
    {
        id: "serengeti",
        name: "Serengeti National Park",
        description:
            "Famous for the annual wildebeest migration and abundant wildlife",
        activities: [
            {
                id: "serengeti-game-drive",
                name: "Game Drive",
                description: "Full day game drive with experienced guide",
                highSeasonCost: calculatePercentage("70+18%"),
                lowSeasonCost: calculatePercentage("30+18%"),
                childHighSeasonCost: calculatePercentage("20+18%"),
                childLowSeasonCost: calculatePercentage("10+18%"),
            },
        ],
    },
];

export const ACCOMMODATIONS: Accommodation[] = [
    {
        id: "osero-serengeti-camp",
        name: "Osero Serengeti Camp",
        description: "5-star lodge with panoramic views of the plains",
        location: "serengeti",
        includesFullBoard: true,
        inPark: true,
        roomTypes: [
            {
                id: "osero-serengeti-single",
                name: "Single Room",
                maxOccupancy: 1,
                highSeasonCost: 100,
                lowSeasonCost: 100,
            },
        ],
    },
];

export const CONCESSION_FEE = calculatePercentage("50+18%");
export const CHILD_CONCESSION_FEE = calculatePercentage("10+18%");
export const VEHICLE_CAPACITY = 7;
