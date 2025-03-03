// Define types for our data
export interface Activity {
  id: string;
  name: string;
  description: string;
  highSeasonCost: number;
  lowSeasonCost: number;
}

export interface Place {
  id: string;
  name: string;
  description: string;
  activities: Activity[];
}

export interface RoomType {
  id: string;
  name: string;
  maxOccupancy: number;
  highSeasonCost: number;
  lowSeasonCost: number;
}

export interface Accommodation {
  id: string;
  name: string;
  description: string;
  location?: string;
  includesFullBoard: boolean;
  inPark: boolean;
  roomTypes: RoomType[];
}

export interface RoomAllocation {
  roomTypeId: string;
  quantity: number;
}

export interface DayPlace {
  placeId: string;
  selectedActivities: string[];
}

export interface DayItinerary {
  id: number;
  places: DayPlace[];
  selectedAccommodation: string | null;
  roomAllocation: RoomAllocation[];
  hasConcessionFee: boolean;
  transportationCost: number;
  notes: string;
}
