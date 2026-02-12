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

export const PLACES: Place[] = [
    {
        id: "serengeti",
        name: "Serengeti National Park",
        description: "Famous for the annual wildebeest migration and abundant wildlife",
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
            {
                id: "serengeti-balloon",
                name: "Hot Air Balloon Safari",
                description: "Sunrise hot air balloon ride over the plains",
                highSeasonCost: 550,
                lowSeasonCost: 450,
                childHighSeasonCost: 275,
                childLowSeasonCost: 225,
            },
        ],
    },
    {
        id: "ngorongoro",
        name: "Ngorongoro Crater",
        description: "UNESCO World Heritage site with incredible density of wildlife",
        activities: [
            {
                id: "ngorongoro-crater-tour",
                name: "Crater Floor Tour",
                description: "Full day exploring the crater floor",
                highSeasonCost: calculatePercentage("250+18%"),
                lowSeasonCost: calculatePercentage("250+18%"),
                childHighSeasonCost: 0,
                childLowSeasonCost: 0,
            },
        ],
    },
    {
        id: "tarangire",
        name: "Tarangire National Park",
        description: "Known for its elephant migration and baobab trees",
        activities: [
            {
                id: "tarangire-game-drive",
                name: "Game Drive",
                description: "Full day game drive focusing on elephants",
                highSeasonCost: calculatePercentage("50+18%"),
                lowSeasonCost: calculatePercentage("50+18%"),
                childHighSeasonCost: calculatePercentage("15+18%"),
                childLowSeasonCost: calculatePercentage("15+18%"),
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
            {
                id: "osero-serengeti-double",
                name: "Double/Twin Room",
                maxOccupancy: 2,
                highSeasonCost: 200,
                lowSeasonCost: 200,
            },
        ],
    },
];

export const CONSTANTS = {
    CONCESSION_FEE: 59,
    CHILD_CONCESSION_FEE: 11.8,
    VEHICLE_CAPACITY: 7,
};
