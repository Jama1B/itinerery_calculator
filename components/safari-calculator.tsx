"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileDown,
  Calendar,
  Users,
  DollarSign,
  Car,
  Hotel,
  MapPin,
  Plus,
  Trash2,
  Bed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { calculatePercentage } from "@/lib/utils";

// Define types for our data
interface Activity {
  id: string;
  name: string;
  description: string;
  highSeasonCost: number;
  lowSeasonCost: number;
}

interface Place {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
}

interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  highSeasonCost: number;
  lowSeasonCost: number;
}

interface Accommodation {
  id: string;
  name: string;
  description: string;
  location?: string;
  includesFullBoard: boolean;
  inPark: boolean;
  roomTypes: RoomType[];
}

interface RoomAllocation {
  roomTypeId: string;
  quantity: number;
}

interface DayPlace {
  placeId: string;
  selectedActivities: string[];
}

interface DayItinerary {
  id: number;
  places: DayPlace[];
  selectedAccommodation: string | null;
  roomAllocation: RoomAllocation[];
  hasConcessionFee: boolean;
  transportationCost: number;
  notes: string;
}

// Sample data
const PLACES: Place[] = [
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
        lowSeasonCost: calculatePercentage("70+18%"),
      },
      {
        id: "serengeti-balloon",
        name: "Hot Air Balloon Safari",
        description: "Sunrise hot air balloon ride over the plains",
        highSeasonCost: 550,
        lowSeasonCost: 450,
      },
      {
        id: "serengeti-walking",
        name: "Walking Safari",
        description: "Guided walking safari with armed ranger",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
    ],
  },
  {
    id: "masai-mara",
    name: "Masai Mara National Reserve",
    description:
      "Famous for the annual wildebeest migration and abundant wildlife",
    activities: [
      {
        id: "masai-mara-game-drive",
        name: "Game Drive",
        description: "Full day game drive with experienced guide",
        highSeasonCost: 200,
        lowSeasonCost: 100,
      },
      {
        id: "masai-mara-balloon",
        name: "Hot Air Balloon Safari",
        description: "Sunrise hot air balloon ride over the plains",
        highSeasonCost: 550,
        lowSeasonCost: 450,
      },
      {
        id: "masai-mara-walking",
        name: "Walking Safari",
        description: "Guided walking safari with armed ranger",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
    ],
  },
  {
    id: "lake-nakuru",
    name: "Lake Nakuru National Park",
    description:
      "Famous for the annual wildebeest migration and abundant wildlife",
    activities: [
      {
        id: "lake-nakuru-game-drive",
        name: "Game Drive",
        description: "Full day game drive with experienced guide",
        highSeasonCost: 60,
        lowSeasonCost: 60,
      },
      {
        id: "lake-nakuru-balloon",
        name: "Hot Air Balloon Safari",
        description: "Sunrise hot air balloon ride over the plains",
        highSeasonCost: 550,
        lowSeasonCost: 450,
      },
      {
        id: "lake-nakuru-walking",
        name: "Walking Safari",
        description: "Guided walking safari with armed ranger",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
    ],
  },

  {
    id: "lake-naivasha",
    name: "Lake Naivasha National Park",
    description:
      "Famous for the annual wildebeest migration and abundant wildlife",
    activities: [
      {
        id: "lake-naivasha-game-drive",
        name: "Game Drive",
        description: "Full day game drive with experienced guide",
        highSeasonCost: 26,
        lowSeasonCost: 26,
      },
      {
        id: "lake-naivasha-balloon",
        name: "Hot Air Balloon Safari",
        description: "Sunrise hot air balloon ride over the plains",
        highSeasonCost: 550,
        lowSeasonCost: 450,
      },
      {
        id: "lake-naivasha-walking",
        name: "Walking Safari",
        description: "Guided walking safari with armed ranger",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
    ],
  },

  {
    id: "amboseli",
    name: "Amboseli National Park",
    description:
      "Famous for the annual wildebeest migration and abundant wildlife",
    activities: [
      {
        id: "amboseli-game-drive",
        name: "Game Drive",
        description: "Full day game drive with experienced guide",
        highSeasonCost: 60,
        lowSeasonCost: 60,
      },
      {
        id: "amboseli-balloon",
        name: "Hot Air Balloon Safari",
        description: "Sunrise hot air balloon ride over the plains",
        highSeasonCost: 550,
        lowSeasonCost: 450,
      },
      {
        id: "amboseli-walking",
        name: "Walking Safari",
        description: "Guided walking safari with armed ranger",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
    ],
  },

  {
    id: "nyerere",
    name: "Nyerere National Park",
    description:
      "Famous for the annual wildebeest migration and abundant wildlife",
    activities: [
      {
        id: "nyerere-game-drive",
        name: "Game Drive",
        description: "Full day game drive with experienced guide",
        highSeasonCost: calculatePercentage("70+18%"),
        lowSeasonCost: calculatePercentage("70+18%"),
      },
      {
        id: "nyerere-balloon",
        name: "Hot Air Balloon Safari",
        description: "Sunrise hot air balloon ride over the plains",
        highSeasonCost: 550,
        lowSeasonCost: 450,
      },
      {
        id: "nyerere-walking",
        name: "Walking Safari",
        description: "Guided walking safari with armed ranger",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
    ],
  },
  {
    id: "ngorongoro",
    name: "Ngorongoro Crater",
    description:
      "UNESCO World Heritage site with incredible density of wildlife",
    activities: [
      {
        id: "ngorongoro-crater-tour",
        name: "Crater Floor Tour",
        description: "Full day exploring the crater floor",
        highSeasonCost: calculatePercentage("250+18%"),
        lowSeasonCost: calculatePercentage("250+18%"),
      },
      {
        id: "ngorongoro-hiking",
        name: "Crater Rim Hike",
        description: "Guided hike along the crater rim",
        highSeasonCost: calculatePercentage("60+18%"),
        lowSeasonCost: calculatePercentage("60+18%"),
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
      },
      {
        id: "tarangire-night-safari",
        name: "Night Safari",
        description: "Evening game drive to spot nocturnal animals",
        highSeasonCost: 130,
        lowSeasonCost: 100,
      },
    ],
  },
  {
    id: "arusha",
    name: "Arusha National Park",
    description: "Known for its elephant migration and baobab trees",
    activities: [
      {
        id: "arusha-game-drive",
        name: "Game Drive",
        description: "Full day game drive focusing on elephants",
        highSeasonCost: calculatePercentage("50+18%"),
        lowSeasonCost: calculatePercentage("50+18%"),
      },
      {
        id: "arusha-night-safari",
        name: "Night Safari",
        description: "Evening game drive to spot nocturnal animals",
        highSeasonCost: 130,
        lowSeasonCost: 100,
      },
    ],
  },
  {
    id: "lake-manyara",
    name: "Lake Manyara National Park",
    description: "Famous for tree-climbing lions and flamingos",
    activities: [
      {
        id: "manyara-game-drive",
        name: "Game Drive",
        description: "Half day game drive around the lake",
        highSeasonCost: calculatePercentage("50+18%"),
        lowSeasonCost: calculatePercentage("50+18%"),
      },
      {
        id: "manyara-canoe",
        name: "Canoe Safari",
        description: "Canoe trip on Lake Manyara",
        highSeasonCost: 110,
        lowSeasonCost: 85,
      },
    ],
  },
  {
    id: "zanzibar",
    name: "Zanzibar Island",
    description: "Beautiful beaches and historic Stone Town",
    activities: [
      {
        id: "zanzibar-beach",
        name: "Beach Day",
        description: "Relaxing day at the beach with snorkeling",
        highSeasonCost: 60,
        lowSeasonCost: 40,
      },
      {
        id: "zanzibar-stone-town",
        name: "Stone Town Tour",
        description: "Guided tour of historic Stone Town",
        highSeasonCost: 80,
        lowSeasonCost: 60,
      },
      {
        id: "zanzibar-spice-tour",
        name: "Spice Tour",
        description: "Visit local spice farms and plantations",
        highSeasonCost: 70,
        lowSeasonCost: 50,
      },
    ],
  },
  {
    id: "arusha",
    name: "Arusha National Park",
    description: "Home to Mount Meru and diverse wildlife",
    activities: [
      {
        id: "arusha-game-drive",
        name: "Game Drive",
        description: "Half day game drive in the park",
        highSeasonCost: 30,
        lowSeasonCost: 30,
      },
      {
        id: "arusha-canoeing",
        name: "Canoeing on Small Momella Lake",
        description: "Guided canoeing experience with wildlife viewing",
        highSeasonCost: 95,
        lowSeasonCost: 75,
      },
    ],
  },
];

const ACCOMMODATIONS: Accommodation[] = [
  {
    id: "osero-serengeti-camp", // Done
    name: "Osero Serengeti Camp",
    description: "5-star lodge with panoramic views of the plains",
    location: "Serengeti National Park",
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
      {
        id: "osero-serengeti-triple",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 300,
        lowSeasonCost: 300,
      },
    ],
  },
  {
    id: "osupuko-tented-camp", //Done
    name: "Osopuko Tented Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Serengeti National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "osupuko-tented-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 101,
        lowSeasonCost: 101,
      },
      {
        id: "osupuko-tented-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 202,
        lowSeasonCost: 202,
      },
      {
        id: "osupuko-tented-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 303,
        lowSeasonCost: 303,
      },
    ],
  },
  {
    id: "serengeti-heritage-camp", //Done
    name: "Serengeti Heritage Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Serengeti National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "serengeti-heritage-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 270,
        lowSeasonCost: 270,
      },
      {
        id: "serengeti-heritage-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 540,
        lowSeasonCost: 540,
      },
      {
        id: "serengeti-heritage-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 750,
        lowSeasonCost: 750,
      },
    ],
  },

  {
    id: "nyota-luxury-tented-camp", //Done
    name: "Nyoa Luxury Tented Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Serengeti National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "nyota-luxury-tented-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 350,
        lowSeasonCost: 350,
      },
      {
        id: "nyota-luxury-tented-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 630,
        lowSeasonCost: 630,
      },
      {
        id: "nyota-luxury-tented-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 945,
        lowSeasonCost: 945,
      },
    ],
  },
  {
    id: "sero-camp", //Done
    name: "Sero Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Serengeti National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "sero-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 150,
        lowSeasonCost: 150,
      },
      {
        id: "sero-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 300,
        lowSeasonCost: 300,
      },
      {
        id: "sero-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 450,
        lowSeasonCost: 450,
      },
    ],
  },
  {
    id: "african-safari-ikoma-camp", //Done
    name: "African Safari Ikoma Tented Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Serengeti National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "african-safari-ikoma-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 100,
        lowSeasonCost: 100,
      },
      {
        id: "african-safari-ikoma-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 200,
        lowSeasonCost: 200,
      },
      {
        id: "african-safari-ikoma-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 300,
        lowSeasonCost: 300,
      },
    ],
  },
  {
    id: "tarangire-sopa-lodge", //Done
    name: "Tarangire Sopa Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Tarangire National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "tarangire-sopa-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 269,
        lowSeasonCost: 234,
      },
      {
        id: "tarangire-sopa-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 414,
        lowSeasonCost: 361,
      },
      {
        id: "tarangire-sopa-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 527,
        lowSeasonCost: 460,
      },
    ],
  },
  {
    id: "masai-mara-sopa-lodge", //Done
    name: "Masai Mara Sopa Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Masai Mara National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "masai-mara-sopa-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 239,
        lowSeasonCost: 154,
      },
      {
        id: "masai-mara-sopa-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 368,
        lowSeasonCost: 237,
      },
      {
        id: "masai-mara-sopa-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 470,
        lowSeasonCost: 302,
      },
    ],
  },
  {
    id: "lake-nakuru-sopa-lodge", //Done
    name: "Lake Nakuru Sopa Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Lake Nakuru National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "lake-nakuru-sopa-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 224,
        lowSeasonCost: 154,
      },
      {
        id: "lake-nakuru-sopa-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 345,
        lowSeasonCost: 237,
      },
      {
        id: "lake-nakuru-sopa-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 440,
        lowSeasonCost: 302,
      },
    ],
  },
  {
    id: "lake-naivasha-sopa-lodge", //Done
    name: "Lake Naivasha Sopa Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Lake Naivasha National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "lake-naivasha-sopa-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 268,
        lowSeasonCost: 204,
      },
      {
        id: "lake-naivasha-sopa-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 413,
        lowSeasonCost: 314,
      },
      {
        id: "lake-naivasha-sopa-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 526,
        lowSeasonCost: 400,
      },
    ],
  },
  {
    id: "amboseli-sopa-standard-lodge", //Done
    name: "Amboseli Sopa Standard Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Amboseli National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "amboseli-sopa-standard-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 153,
        lowSeasonCost: 140,
      },
      {
        id: "amboseli-sopa-standard-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 235,
        lowSeasonCost: 216,
      },
      {
        id: "amboseli-sopa-standard-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 300,
        lowSeasonCost: 275,
      },
    ],
  },
  {
    id: "amboseli-sopa-premium-lodge", //Done
    name: "Amboseli Sopa Premium Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Amboseli National Park",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "amboseli-sopa-premium-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 160,
        lowSeasonCost: 147,
      },
      {
        id: "amboseli-sopa-premium-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 246,
        lowSeasonCost: 226,
      },
      {
        id: "amboseli-sopa-premium-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 313,
        lowSeasonCost: 288,
      },
    ],
  },
  {
    id: "samburu-sopa-lodge", //Done
    name: "Samburu Sopa Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Samburu National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "samburu-sopa-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 146,
        lowSeasonCost: 140,
      },
      {
        id: "samburu-sopa-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 224,
        lowSeasonCost: 216,
      },
      {
        id: "samburu-sopa-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 286,
        lowSeasonCost: 275,
      },
    ],
  },
  {
    id: "jambo-mara-wooden-cottage-lodge", //Done
    name: "Jambo Mara Wooden Cottage Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Masai Mara National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "jambo-mara-wooden-cottage-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 180,
        lowSeasonCost: 95,
      },
      {
        id: "jambo-mara-wooden-cottage-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 240,
        lowSeasonCost: 140,
      },
    ],
  },
  {
    id: "jambo-mara-glass-cottage-lodge", //Done
    name: "Jambo Mara Glass Cottage Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Masai Mara National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "jambo-mara-glass-cottage-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 220,
        lowSeasonCost: 115,
      },
      {
        id: "jambo-mara-glass-cottage-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 330,
        lowSeasonCost: 170,
      },
      {
        id: "jambo-mara-glass-cottage-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 495,
        lowSeasonCost: 255,
      },
    ],
  },
  {
    id: "jambo-mara-superior-delux-lodge", //Done
    name: "Jambo Mara Superior Delux Lodge",
    description: "Authentic safari experience with comfortable tents",
    location: "Masai Mara National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "jambo-mara-superior-delux-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 260,
        lowSeasonCost: 200,
      },
      {
        id: "jambo-mara-superior-delux-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 380,
        lowSeasonCost: 300,
      },
      {
        id: "jambo-mara-superior-delux-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 570,
        lowSeasonCost: 450,
      },
    ],
  },
  {
    id: "sentrim-mara-camp", //Done
    name: "Sentrim Mara Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Masai Mara National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "sentrim-mara-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 154,
        lowSeasonCost: 120,
      },
      {
        id: "sentrim-mara-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 253,
        lowSeasonCost: 220,
      },
      {
        id: "sentrim-mara-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 310,
        lowSeasonCost: 275,
      },
    ],
  },
  {
    id: "sentrim-amboseli-camp", //Done
    name: "Sentrim Amboseli Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Amboseli National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "sentrim-amboseli-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 145,
        lowSeasonCost: 120,
      },
      {
        id: "sentrim-amboseli-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 230,
        lowSeasonCost: 210,
      },
      {
        id: "sentrim-amboseli-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 300,
        lowSeasonCost: 264,
      },
    ],
  },
  {
    id: "sentrim-tsavo-camp", //Done
    name: "Sentrim Tsavo Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Tsavo National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "sentrim-tsavo-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 132,
        lowSeasonCost: 110,
      },
      {
        id: "sentrim-tsavo-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 220,
        lowSeasonCost: 200,
      },
      {
        id: "sentrim-tsavo-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 264,
        lowSeasonCost: 242,
      },
    ],
  },
  {
    id: "sentrim-elementaita-camp", //Done
    name: "Sentrim Elementaita Camp",
    description: "Authentic safari experience with comfortable tents",
    location: "Elementaita National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "sentrim-elementaita-camp-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 145,
        lowSeasonCost: 120,
      },
      {
        id: "sentrim-elementaita-camp-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 220,
        lowSeasonCost: 198,
      },
      {
        id: "sentrim-elementaita-camp-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 286,
        lowSeasonCost: 255,
      },
    ],
  },
  {
    id: "eileens-tree-inn", //Done
    name: "Eileen's Trees Inn",
    description: "Luxury lodge on the crater rim with stunning views",
    location: "Ngorongoro Crater",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "eileens-tree-inn-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 70,
        lowSeasonCost: 70,
      },
      {
        id: "eileens-tree-inn-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 140,
        lowSeasonCost: 140,
      },
      {
        id: "eileens-tree-inn-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 210,
        lowSeasonCost: 210,
      },
    ],
  },
  {
    id: "farm-of-dreams-lodge", //Done
    name: "Farm of Dreams Lodge",
    description: "Colonial-style farm house with beautiful gardens",
    location: "Ngorongoro Crater",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "farm-of-dreams-lodge-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 100,
        lowSeasonCost: 100,
      },
      {
        id: "farm-of-dreams-lodge-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 195,
        lowSeasonCost: 195,
      },
      {
        id: "farm-of-dreams-lodge-triple",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 273,
        lowSeasonCost: 273,
      },
    ],
  },
  {
    id: "ngare-lodge", //Done
    name: "Ngare Sero Mountain Lodge",
    description: "Colonial-style farm house with beautiful gardens",
    location: "Tarangire National Park",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "ngare-lodge-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 45,
        lowSeasonCost: 45,
      },
      {
        id: "ngare-lodge-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 90,
        lowSeasonCost: 90,
      },
      {
        id: "ngare-lodge-triple",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 135,
        lowSeasonCost: 135,
      },
    ],
  },
  {
    id: "green-mountain-lodge", //Done
    name: "Green Mountain Lodge",
    description: "Unique rooms built into baobab trees",
    location: "Arusha",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "green-mountain-lodge-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 300,
        lowSeasonCost: 240,
      },
      {
        id: "green-mountain-lodge-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 380,
        lowSeasonCost: 300,
      },
      {
        id: "green-mountain-lodge-family",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 600,
        lowSeasonCost: 480,
      },
    ],
  },
  {
    id: "marera-valley-lodge", //Done
    name: "Marera Valley Lodge",
    description: "Lodge overlooking Lake Manyara and the Rift Valley",
    location: "karatu",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "marera-valley-lodge-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 100,
        lowSeasonCost: 100,
      },
      {
        id: "marera-valley-lodge-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 191,
        lowSeasonCost: 191,
      },
      {
        id: "marera-valley-lodge-triple",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 300,
        lowSeasonCost: 300,
      },
    ],
  },
  {
    id: "neptune-ngorongoro-luxury-lodge", //Done
    name: "Neptune Ngorongoro Luxury Lodge",
    description: "Beachfront resort with white sand beaches",
    location: "Ngorongoro",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "neptune-ngorongoro-luxury-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 444,
        lowSeasonCost: 444,
      },
      {
        id: "neptune-ngorongoro-luxury-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 867,
        lowSeasonCost: 867,
      },
      {
        id: "neptune-ngorongoro-luxury-triple",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 1300,
        lowSeasonCost: 1300,
      },
    ],
  },
  {
    id: "lila-tanzania-lodge", //Done
    name: "Lilac Tanzania Hotel",
    description: "Historic hotel in the heart of Stone Town",
    location: "karatu",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [
      {
        id: "lila-tanzania-lodge-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 75,
        lowSeasonCost: 75,
      },
      {
        id: "lila-tanzania-lodge-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 150,
        lowSeasonCost: 150,
      },
      {
        id: "lila-tanzania-lodge-triple",
        name: "Triple Room",
        maxOccupancy: 3,
        highSeasonCost: 225,
        lowSeasonCost: 225,
      },
    ],
  },
  {
    id: "arusha-mountain-lodge",
    name: "Arusha Mountain Lodge",
    description: "Cozy lodge with views of Mount Meru",
    includesFullBoard: true,
    inPark: true,
    roomTypes: [
      {
        id: "arusha-mountain-single",
        name: "Single Room",
        maxOccupancy: 1,
        highSeasonCost: 210,
        lowSeasonCost: 170,
      },
      {
        id: "arusha-mountain-double",
        name: "Double Room",
        maxOccupancy: 2,
        highSeasonCost: 270,
        lowSeasonCost: 210,
      },
      {
        id: "arusha-mountain-family",
        name: "Family Room",
        maxOccupancy: 4,
        highSeasonCost: 420,
        lowSeasonCost: 330,
      },
    ],
  },
];

const CONCESSION_FEE = 60; // $60 per person

export default function SafariCalculator() {
  const [days, setDays] = useState<number>(3);
  const [clients, setClients] = useState<number>(2);
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [profitAmount, setProfitAmount] = useState<number>(500);
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [isHighSeason, setIsHighSeason] = useState<boolean>(true);

  // Initialize itinerary when days change
  useEffect(() => {
    initializeItinerary(days);
  }, [days]);

  const initializeItinerary = (numDays: number) => {
    const newItinerary: DayItinerary[] = [];
    for (let i = 0; i < numDays; i++) {
      newItinerary.push({
        id: i + 1,
        places: [],
        selectedAccommodation: null,
        roomAllocation: [],
        hasConcessionFee: false,
        transportationCost: 0,
        notes: "",
      });
    }
    setItinerary(newItinerary);
  };

  // Handle days input change
  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value) || 0;
    if (value > 0) {
      setDays(value);
    }
  };

  // Update itinerary item
  const updateItinerary = (
    id: number,
    field: keyof DayItinerary,
    value: any
  ) => {
    setItinerary((prev) =>
      prev.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  };

  // Add a place to a day
  const addPlaceToDay = (dayId: number) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            places: [...day.places, { placeId: "", selectedActivities: [] }],
          };
        }
        return day;
      })
    );
  };

  // Remove a place from a day
  const removePlaceFromDay = (dayId: number, placeIndex: number) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const updatedPlaces = [...day.places];
          updatedPlaces.splice(placeIndex, 1);
          return {
            ...day,
            places: updatedPlaces,
          };
        }
        return day;
      })
    );
  };

  // Update a place in a day
  const updateDayPlace = (
    dayId: number,
    placeIndex: number,
    placeId: string
  ) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const updatedPlaces = [...day.places];
          updatedPlaces[placeIndex] = {
            placeId,
            selectedActivities: [],
          };
          return {
            ...day,
            places: updatedPlaces,
          };
        }
        return day;
      })
    );
  };

  // Toggle activity selection
  const toggleActivity = (
    dayId: number,
    placeIndex: number,
    activityId: string
  ) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const updatedPlaces = [...day.places];
          const activities = [...updatedPlaces[placeIndex].selectedActivities];
          const index = activities.indexOf(activityId);

          if (index === -1) {
            activities.push(activityId);
          } else {
            activities.splice(index, 1);
          }

          updatedPlaces[placeIndex] = {
            ...updatedPlaces[placeIndex],
            selectedActivities: activities,
          };

          return { ...day, places: updatedPlaces };
        }
        return day;
      })
    );
  };

  // Toggle concession fee
  const toggleConcessionFee = (dayId: number) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          return {
            ...day,
            hasConcessionFee: !day.hasConcessionFee,
          };
        }
        return day;
      })
    );
  };

  // Update room allocation
  const updateRoomAllocation = (
    dayId: number,
    roomTypeId: string,
    quantity: number
  ) => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.id === dayId) {
          const existingAllocation = day.roomAllocation.find(
            (room) => room.roomTypeId === roomTypeId
          );

          let updatedAllocation: RoomAllocation[];

          if (existingAllocation) {
            // Update existing allocation
            if (quantity <= 0) {
              // Remove if quantity is 0 or negative
              updatedAllocation = day.roomAllocation.filter(
                (room) => room.roomTypeId !== roomTypeId
              );
            } else {
              // Update quantity
              updatedAllocation = day.roomAllocation.map((room) =>
                room.roomTypeId === roomTypeId ? { ...room, quantity } : room
              );
            }
          } else if (quantity > 0) {
            // Add new allocation if quantity is positive
            updatedAllocation = [
              ...day.roomAllocation,
              { roomTypeId, quantity },
            ];
          } else {
            // No change if trying to add with 0 or negative quantity
            updatedAllocation = [...day.roomAllocation];
          }

          return {
            ...day,
            roomAllocation: updatedAllocation,
          };
        }
        return day;
      })
    );
  };

  // Get place by ID
  const getPlaceById = (id: string | null) => {
    if (!id) return null;
    return PLACES.find((place) => place.id === id) || null;
  };

  // Get accommodation by ID
  const getAccommodationById = (id: string | null) => {
    if (!id) return null;
    return ACCOMMODATIONS.find((acc) => acc.id === id) || null;
  };

  // Get room type by ID
  const getRoomTypeById = (
    accommodationId: string | null,
    roomTypeId: string
  ) => {
    if (!accommodationId) return null;
    const accommodation = getAccommodationById(accommodationId);
    if (!accommodation) return null;
    return (
      accommodation.roomTypes.find((room) => room.id === roomTypeId) || null
    );
  };

  // Get activity by ID
  const getActivityById = (placeId: string | null, activityId: string) => {
    if (!placeId) return null;
    const place = getPlaceById(placeId);
    if (!place) return null;
    return (
      place.activities.find((activity) => activity.id === activityId) || null
    );
  };

  // Calculate total clients accommodated
  const calculateTotalClientsAccommodated = (
    roomAllocation: RoomAllocation[],
    accommodationId: string | null
  ) => {
    if (!accommodationId) return 0;

    return roomAllocation.reduce((total, room) => {
      const roomType = getRoomTypeById(accommodationId, room.roomTypeId);
      if (!roomType) return total;
      return total + roomType.maxOccupancy * room.quantity;
    }, 0);
  };

  // Calculate day costs
  const calculateDayCosts = (day: DayItinerary) => {
    let accommodationCost = 0;
    let activitiesCost = 0;
    let concessionFee = 0;

    // Accommodation cost
    if (day.selectedAccommodation && day.selectedAccommodation !== "none") {
      day.roomAllocation.forEach((room) => {
        const roomType = getRoomTypeById(
          day.selectedAccommodation,
          room.roomTypeId
        );
        if (roomType) {
          accommodationCost +=
            (isHighSeason ? roomType.highSeasonCost : roomType.lowSeasonCost) *
            room.quantity;
        }
      });
    }

    // Activities cost
    day.places.forEach((place) => {
      if (place.placeId) {
        place.selectedActivities.forEach((activityId) => {
          const activity = getActivityById(place.placeId, activityId);
          if (activity) {
            activitiesCost +=
              (isHighSeason
                ? activity.highSeasonCost
                : activity.lowSeasonCost) * clients;
          }
        });
      }
    });

    // Concession fee if applicable
    if (day.hasConcessionFee) {
      concessionFee = CONCESSION_FEE * clients;
    }

    return {
      accommodationCost,
      activitiesCost,
      transportationCost: day.transportationCost,
      concessionFee,
      totalCost:
        accommodationCost +
        activitiesCost +
        day.transportationCost +
        concessionFee,
    };
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalAccommodation = 0;
    let totalActivities = 0;
    let totalTransportation = 0;
    let totalConcessionFees = 0;

    itinerary.forEach((day) => {
      const costs = calculateDayCosts(day);
      totalAccommodation += costs.accommodationCost;
      totalActivities += costs.activitiesCost;
      totalTransportation += costs.transportationCost;
      totalConcessionFees += costs.concessionFee;
    });

    const subtotal =
      totalAccommodation +
      totalActivities +
      totalTransportation +
      totalConcessionFees;
    const total = subtotal + profitAmount;
    const perPerson = clients > 0 ? total / clients : 0;

    return {
      accommodation: totalAccommodation,
      activities: totalActivities,
      transportation: totalTransportation,
      concessionFees: totalConcessionFees,
      subtotal,
      profit: profitAmount,
      total,
      perPerson,
    };
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Export itinerary as PDF (simplified for demo)
  const exportItinerary = () => {
    alert(
      "Export functionality would generate a PDF with the complete itinerary and cost breakdown."
    );
  };

  // Generate suggested room allocation based on number of clients
  const suggestRoomAllocation = (
    accommodationId: string | null,
    numClients: number
  ) => {
    if (!accommodationId || accommodationId === "none") return [];

    const accommodation = getAccommodationById(accommodationId);
    if (!accommodation) return [];

    // Sort room types by efficiency (cost per person)
    const sortedRoomTypes = [...accommodation.roomTypes].sort((a, b) => {
      const aCostPerPerson =
        (isHighSeason ? a.highSeasonCost : a.lowSeasonCost) / a.maxOccupancy;
      const bCostPerPerson =
        (isHighSeason ? b.highSeasonCost : b.lowSeasonCost) / b.maxOccupancy;
      return aCostPerPerson - bCostPerPerson;
    });

    let remainingClients = numClients;
    const allocation: RoomAllocation[] = [];

    // First try to fill larger rooms for efficiency
    for (const roomType of sortedRoomTypes.sort(
      (a, b) => b.maxOccupancy - a.maxOccupancy
    )) {
      if (remainingClients <= 0) break;

      const numRooms = Math.floor(remainingClients / roomType.maxOccupancy);
      if (numRooms > 0) {
        allocation.push({
          roomTypeId: roomType.id,
          quantity: numRooms,
        });
        remainingClients -= numRooms * roomType.maxOccupancy;
      }
    }

    // Handle remaining clients with smallest suitable rooms
    if (remainingClients > 0) {
      for (const roomType of sortedRoomTypes.sort(
        (a, b) => a.maxOccupancy - b.maxOccupancy
      )) {
        if (remainingClients <= 0) break;

        if (roomType.maxOccupancy >= remainingClients) {
          allocation.push({
            roomTypeId: roomType.id,
            quantity: 1,
          });
          remainingClients = 0;
        }
      }

      // If we still have remaining clients, add one more of the largest room type
      if (remainingClients > 0) {
        const largestRoomType = sortedRoomTypes.sort(
          (a, b) => b.maxOccupancy - a.maxOccupancy
        )[0];
        const existingAllocation = allocation.find(
          (a) => a.roomTypeId === largestRoomType.id
        );

        if (existingAllocation) {
          existingAllocation.quantity += 1;
        } else {
          allocation.push({
            roomTypeId: largestRoomType.id,
            quantity: 1,
          });
        }
      }
    }

    return allocation;
  };

  // Handle accommodation selection
  const handleAccommodationChange = (
    dayId: number,
    accommodationId: string
  ) => {
    if (accommodationId === "none") {
      updateItinerary(dayId, "selectedAccommodation", "none");
      updateItinerary(dayId, "roomAllocation", []);
      return;
    }

    const suggestedAllocation = suggestRoomAllocation(accommodationId, clients);

    updateItinerary(dayId, "selectedAccommodation", accommodationId);
    updateItinerary(dayId, "roomAllocation", suggestedAllocation);
  };

  const totals = calculateTotals();

  return (
    <Tabs
      defaultValue="setup"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-6"
    >
      <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
        <TabsTrigger value="setup">Setup</TabsTrigger>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
      </TabsList>

      {/* Setup Tab */}
      <TabsContent value="setup" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Safari Details</CardTitle>
            <CardDescription>
              Enter the basic information about your safari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="days" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Number of Days
                </Label>
                <Input
                  id="days"
                  type="number"
                  min="1"
                  value={days}
                  onChange={handleDaysChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clients" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Clients
                </Label>
                <Input
                  id="clients"
                  type="number"
                  min="1"
                  value={clients}
                  onChange={(e) =>
                    setClients(Number.parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profit" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Profit Amount ($)
                </Label>
                <Input
                  id="profit"
                  type="number"
                  min="0"
                  value={profitAmount}
                  onChange={(e) =>
                    setProfitAmount(Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="season-toggle">Season:</Label>
              <div className="flex items-center space-x-2">
                <span
                  className={!isHighSeason ? "font-medium" : "text-gray-500"}
                >
                  Low Season
                </span>
                <Switch
                  id="season-toggle"
                  checked={isHighSeason}
                  onCheckedChange={setIsHighSeason}
                />
                <span
                  className={isHighSeason ? "font-medium" : "text-gray-500"}
                >
                  High Season
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setActiveTab("itinerary")}>
                Continue to Itinerary
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Itinerary Tab */}
      <TabsContent value="itinerary" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-green-800">
            Day by Day Itinerary
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab("setup")}>
              Back to Setup
            </Button>
            <Button onClick={() => setActiveTab("summary")}>
              Continue to Summary
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Label htmlFor="season-toggle-2">Season:</Label>
          <div className="flex items-center space-x-2">
            <span className={!isHighSeason ? "font-medium" : "text-gray-500"}>
              Low Season
            </span>
            <Switch
              id="season-toggle-2"
              checked={isHighSeason}
              onCheckedChange={setIsHighSeason}
            />
            <span className={isHighSeason ? "font-medium" : "text-gray-500"}>
              High Season
            </span>
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {itinerary.map((day) => (
            <AccordionItem key={day.id} value={`day-${day.id}`}>
              <AccordionTrigger className="hover:bg-green-50 px-4 rounded-md">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 hover:bg-green-100"
                  >
                    Day {day.id}
                  </Badge>
                  <span className="font-medium">
                    {day.places.length > 0
                      ? day.places
                          .map((p) => getPlaceById(p.placeId)?.name || "")
                          .filter(Boolean)
                          .join(" & ")
                      : `Day ${day.id} Itinerary`}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4">
                <Card className="border-green-200">
                  <CardContent className="space-y-6 pt-6">
                    {/* Places Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-medium flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Places to Visit
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addPlaceToDay(day.id)}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" /> Add Place
                        </Button>
                      </div>

                      {day.places.length === 0 && (
                        <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                          No places added. Click "Add Place" to begin.
                        </div>
                      )}

                      {day.places.map((place, placeIndex) => (
                        <div
                          key={placeIndex}
                          className="border rounded-md p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">
                              Place {placeIndex + 1}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                removePlaceFromDay(day.id, placeIndex)
                              }
                              className="h-8 w-8 p-0 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove place</span>
                            </Button>
                          </div>

                          {/* Place Selection */}
                          <div className="space-y-2">
                            <Label htmlFor={`place-${day.id}-${placeIndex}`}>
                              Select Destination
                            </Label>
                            <Select
                              value={place.placeId || ""}
                              onValueChange={(value) =>
                                updateDayPlace(day.id, placeIndex, value)
                              }
                            >
                              <SelectTrigger
                                id={`place-${day.id}-${placeIndex}`}
                              >
                                <SelectValue placeholder="Select a place to visit" />
                              </SelectTrigger>
                              <SelectContent>
                                {PLACES.map((placeOption) => (
                                  <SelectItem
                                    key={placeOption.id}
                                    value={placeOption.id}
                                  >
                                    {placeOption.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {place.placeId && (
                              <p className="text-sm text-gray-500 mt-1">
                                {getPlaceById(place.placeId)?.description}
                              </p>
                            )}
                          </div>

                          {/* Activities Selection */}
                          {place.placeId && (
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                Activities
                              </Label>
                              <div className="space-y-2">
                                {getPlaceById(place.placeId)?.activities.map(
                                  (activity) => (
                                    <Collapsible
                                      key={activity.id}
                                      className="border rounded-md"
                                    >
                                      <div className="flex items-center justify-between p-2">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            id={`activity-${day.id}-${placeIndex}-${activity.id}`}
                                            checked={place.selectedActivities.includes(
                                              activity.id
                                            )}
                                            onCheckedChange={() =>
                                              toggleActivity(
                                                day.id,
                                                placeIndex,
                                                activity.id
                                              )
                                            }
                                          />
                                          <label
                                            htmlFor={`activity-${day.id}-${placeIndex}-${activity.id}`}
                                            className="font-medium cursor-pointer"
                                          >
                                            {activity.name}
                                          </label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-green-700">
                                            {formatCurrency(
                                              isHighSeason
                                                ? activity.highSeasonCost
                                                : activity.lowSeasonCost
                                            )}
                                            <span className="text-xs text-gray-500">
                                              {" "}
                                              per person
                                            </span>
                                          </span>
                                          <CollapsibleTrigger className="rounded-full hover:bg-gray-100 p-1">
                                            <svg
                                              width="15"
                                              height="15"
                                              viewBox="0 0 15 15"
                                              fill="none"
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                            >
                                              <path
                                                d="M7.5 12L7.5 3M7.5 3L3.5 7M7.5 3L11.5 7"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              ></path>
                                            </svg>
                                          </CollapsibleTrigger>
                                        </div>
                                      </div>
                                      <CollapsibleContent className="p-2 pt-0 border-t">
                                        <p className="text-sm text-gray-600">
                                          {activity.description}
                                        </p>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Accommodation Selection */}
                    <div className="space-y-4">
                      <Label
                        htmlFor={`accommodation-${day.id}`}
                        className="text-lg font-medium flex items-center gap-2"
                      >
                        <Hotel className="h-5 w-5" />
                        {day.id === days
                          ? "Accommodation (Optional for Last Day)"
                          : "Overnight Accommodation"}
                      </Label>
                      <Select
                        value={day.selectedAccommodation || ""}
                        onValueChange={(value) =>
                          handleAccommodationChange(day.id, value)
                        }
                      >
                        <SelectTrigger id={`accommodation-${day.id}`}>
                          <SelectValue
                            placeholder={
                              day.id === days
                                ? "No accommodation needed (last day)"
                                : "Select accommodation"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            No accommodation (departure day)
                          </SelectItem>
                          {ACCOMMODATIONS.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {day.selectedAccommodation &&
                        day.selectedAccommodation !== "none" && (
                          <div className="space-y-4">
                            <p className="text-sm text-gray-500">
                              {
                                getAccommodationById(day.selectedAccommodation)
                                  ?.description
                              }
                            </p>
                            <p className="text-green-700 font-medium">
                              Includes: Full Board (All Meals)
                            </p>

                            {/* Room Allocation */}
                            <div className="border rounded-md p-4 bg-gray-50">
                              <div className="flex items-center gap-2 mb-3">
                                <Bed className="h-4 w-4" />
                                <h4 className="font-medium">Room Allocation</h4>
                              </div>

                              <div className="space-y-3">
                                {getAccommodationById(
                                  day.selectedAccommodation
                                )?.roomTypes.map((roomType) => {
                                  const allocation = day.roomAllocation.find(
                                    (r) => r.roomTypeId === roomType.id
                                  );
                                  const quantity = allocation
                                    ? allocation.quantity
                                    : 0;

                                  return (
                                    <div
                                      key={roomType.id}
                                      className="flex items-center justify-between"
                                    >
                                      <div>
                                        <p className="font-medium">
                                          {roomType.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Max {roomType.maxOccupancy}{" "}
                                          {roomType.maxOccupancy === 1
                                            ? "person"
                                            : "people"}{" "}
                                          •{" "}
                                          {formatCurrency(
                                            isHighSeason
                                              ? roomType.highSeasonCost
                                              : roomType.lowSeasonCost
                                          )}{" "}
                                          per room
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={() =>
                                            updateRoomAllocation(
                                              day.id,
                                              roomType.id,
                                              Math.max(0, quantity - 1)
                                            )
                                          }
                                        >
                                          -
                                        </Button>
                                        <span className="w-8 text-center">
                                          {quantity}
                                        </span>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 w-8 p-0"
                                          onClick={() =>
                                            updateRoomAllocation(
                                              day.id,
                                              roomType.id,
                                              quantity + 1
                                            )
                                          }
                                        >
                                          +
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}

                                <Separator className="my-2" />

                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="text-sm font-medium">
                                      Total Accommodated:
                                    </span>
                                    <span className="ml-2">
                                      {calculateTotalClientsAccommodated(
                                        day.roomAllocation,
                                        day.selectedAccommodation
                                      )}{" "}
                                      / {clients} clients
                                    </span>
                                  </div>
                                  {calculateTotalClientsAccommodated(
                                    day.roomAllocation,
                                    day.selectedAccommodation
                                  ) < clients && (
                                    <Badge variant="destructive">
                                      Not enough rooms
                                    </Badge>
                                  )}
                                  {calculateTotalClientsAccommodated(
                                    day.roomAllocation,
                                    day.selectedAccommodation
                                  ) > clients && (
                                    <Badge
                                      variant="outline"
                                      className="bg-amber-100 text-amber-800 border-amber-200"
                                    >
                                      Extra capacity
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Concession Fee Toggle */}
                            {getAccommodationById(day.selectedAccommodation)
                              ?.inPark && (
                              <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded-md">
                                <Checkbox
                                  id={`concession-${day.id}`}
                                  checked={day.hasConcessionFee}
                                  onCheckedChange={() =>
                                    toggleConcessionFee(day.id)
                                  }
                                />
                                <label
                                  htmlFor={`concession-${day.id}`}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  Add park concession fee (${CONCESSION_FEE} per
                                  person)
                                </label>
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Transportation Cost */}
                    <div className="space-y-2">
                      <Label
                        htmlFor={`transportation-cost-${day.id}`}
                        className="flex items-center gap-2"
                      >
                        <Car className="h-4 w-4" />
                        Transportation Cost
                      </Label>
                      <Input
                        id={`transportation-cost-${day.id}`}
                        type="number"
                        min="0"
                        placeholder="0.00"
                        value={day.transportationCost || ""}
                        onChange={(e) =>
                          updateItinerary(
                            day.id,
                            "transportationCost",
                            Number.parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    {/* Day Summary */}
                    <div className="bg-green-50 p-4 rounded-md">
                      <h4 className="font-medium text-green-800 mb-2">
                        Day {day.id} Cost Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {day.selectedAccommodation &&
                          day.selectedAccommodation !== "none" && (
                            <>
                              <div>Accommodation (Full Board):</div>
                              <div className="text-right font-medium">
                                {formatCurrency(
                                  calculateDayCosts(day).accommodationCost
                                )}
                              </div>
                            </>
                          )}

                        {day.places.some(
                          (p) => p.selectedActivities.length > 0
                        ) && (
                          <>
                            <div>
                              Activities ({clients}{" "}
                              {clients === 1 ? "person" : "people"}):
                            </div>
                            <div className="text-right font-medium">
                              {formatCurrency(
                                calculateDayCosts(day).activitiesCost
                              )}
                            </div>
                          </>
                        )}

                        <div>Transportation:</div>
                        <div className="text-right font-medium">
                          {formatCurrency(day.transportationCost)}
                        </div>

                        {day.hasConcessionFee && (
                          <>
                            <div>
                              Concession Fees ({clients}{" "}
                              {clients === 1 ? "person" : "people"}):
                            </div>
                            <div className="text-right font-medium">
                              {formatCurrency(CONCESSION_FEE * clients)}
                            </div>
                          </>
                        )}

                        <Separator className="col-span-2 my-1" />

                        <div className="font-medium">Day Total:</div>
                        <div className="text-right font-bold">
                          {formatCurrency(calculateDayCosts(day).totalCost)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setActiveTab("setup")}>
            Back to Setup
          </Button>
          <Button onClick={() => setActiveTab("summary")}>
            Continue to Summary
          </Button>
        </div>
      </TabsContent>

      {/* Summary Tab */}
      <TabsContent value="summary" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-green-800">
            Safari Cost Summary
          </h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab("itinerary")}>
              Back to Itinerary
            </Button>
            <Button onClick={exportItinerary}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Itinerary
            </Button>
          </div>
        </div>

        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle>Safari Overview</CardTitle>
            <CardDescription>
              {days} day safari for {clients}{" "}
              {clients === 1 ? "client" : "clients"} with ${profitAmount} profit
              ({isHighSeason ? "High Season" : "Low Season"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">
                  Total Accommodation (Full Board):
                </div>
                <div className="font-medium text-right">
                  {formatCurrency(totals.accommodation)}
                </div>

                <div className="text-gray-600">Total Activities:</div>
                <div className="font-medium text-right">
                  {formatCurrency(totals.activities)}
                </div>

                <div className="text-gray-600">Total Transportation:</div>
                <div className="font-medium text-right">
                  {formatCurrency(totals.transportation)}
                </div>

                {totals.concessionFees > 0 && (
                  <>
                    <div className="text-gray-600">Total Concession Fees:</div>
                    <div className="font-medium text-right">
                      {formatCurrency(totals.concessionFees)}
                    </div>
                  </>
                )}

                <Separator className="col-span-2 my-2" />

                <div className="text-gray-600">Subtotal:</div>
                <div className="font-medium text-right">
                  {formatCurrency(totals.subtotal)}
                </div>

                <div className="text-gray-600">Profit:</div>
                <div className="font-medium text-right">
                  {formatCurrency(totals.profit)}
                </div>

                <Separator className="col-span-2 my-2" />

                <div className="text-gray-600 font-semibold">
                  Total Cost (for {clients}{" "}
                  {clients === 1 ? "client" : "clients"}):
                </div>
                <div className="font-bold text-right text-green-800">
                  {formatCurrency(totals.total)}
                </div>

                <div className="text-gray-600 font-semibold">
                  Cost Per Person:
                </div>
                <div className="font-bold text-right text-green-800 text-xl">
                  {formatCurrency(totals.perPerson)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-md border border-green-200">
                <h3 className="font-medium text-green-800 mb-4">
                  Itinerary Summary
                </h3>
                <div className="space-y-4">
                  {itinerary.map((day) => (
                    <div
                      key={day.id}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm"
                    >
                      <div className="font-medium">Day {day.id}:</div>
                      <div className="md:col-span-3">
                        {day.places.length > 0
                          ? day.places
                              .map((p) => getPlaceById(p.placeId)?.name || "")
                              .filter(Boolean)
                              .join(" & ")
                          : "No places selected"}
                      </div>
                      <div className="text-gray-500">Accommodation:</div>
                      <div className="md:col-span-3">
                        {day.id === days && !day.selectedAccommodation
                          ? "No accommodation (departure day)"
                          : day.selectedAccommodation &&
                            day.selectedAccommodation !== "none"
                          ? getAccommodationById(day.selectedAccommodation)
                              ?.name
                          : "Not specified"}

                        {day.selectedAccommodation &&
                          day.selectedAccommodation !== "none" &&
                          day.roomAllocation.length > 0 && (
                            <span className="text-gray-500">
                              {" - "}
                              {day.roomAllocation
                                .map((room, idx) => {
                                  const roomType = getRoomTypeById(
                                    day.selectedAccommodation,
                                    room.roomTypeId
                                  );
                                  return roomType
                                    ? `${room.quantity}x ${roomType.name}`
                                    : "";
                                })
                                .filter(Boolean)
                                .join(", ")}
                              {" - "}
                              {formatCurrency(
                                calculateDayCosts(day).accommodationCost
                              )}
                            </span>
                          )}

                        {day.hasConcessionFee && " (+ Concession Fee)"}
                      </div>
                      {day.id < itinerary.length && (
                        <Separator className="col-span-4 my-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
