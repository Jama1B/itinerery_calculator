
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
  Calendar,
  Users,
  DollarSign,
  Car,
  Hotel,
  MapPin,
  Plus,
  Trash2,
  Bed,
  BabyIcon as Child,
  Save,
  FileDown,
  GripVertical,
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
import { jsPDF } from "jspdf";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useClientStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { SaveItineraryDialog } from "@/components/save-itinerary-dialog";
import { LoadItineraryDialog } from "@/components/load-itinerary-dialog";
import type { SavedItinerary } from "@/lib/db";
import type {
  DayItinerary,
  RoomAllocation,
  Place,
  Accommodation,
} from "@/types/safaris";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Day Item Component
interface SortableDayProps {
  day: DayItinerary;
  places: Place[];
  accommodations: Accommodation[];
  isHighSeason: boolean;
  constants: {
    CONCESSION_FEE: number;
    CHILD_CONCESSION_FEE: number;
    VEHICLE_CAPACITY: number;
  };
  getTotalClients: () => number;
  getVehicleCount: (clientCount: number) => number;
  formatCurrency: (amount: number) => string;
  getPlaceById: (id: string | null) => Place | null;
  getAccommodationById: (id: string | null) => Accommodation | null;
  getRoomTypeById: (accommodationId: string | null, roomTypeId: string) => any;
  getActivityById: (placeId: string | null, activityId: string) => any;
  calculateDayCosts: (day: DayItinerary) => any;
  calculateTotalClientsAccommodated: (
    roomAllocation: RoomAllocation[],
    accommodationId: string | null
  ) => number;
  addPlaceToDay: (dayId: number) => void;
  removePlaceFromDay: (dayId: number, placeIndex: number) => void;
  updateDayPlace: (dayId: number, placeIndex: number, placeId: string) => void;
  toggleActivity: (
    dayId: number,
    placeIndex: number,
    activityId: string
  ) => void;
  toggleConcessionFee: (dayId: number) => void;
  handleAccommodationChange: (dayId: number, accommodationId: string) => void;
  updateRoomAllocation: (
    dayId: number,
    roomTypeId: string,
    quantity: number
  ) => void;
  updateItinerary: (id: number, field: keyof DayItinerary, value: any) => void;
}

function SortableDayItem({
  day,
  places,
  accommodations,
  isHighSeason,
  constants,
  getTotalClients,
  getVehicleCount,
  formatCurrency,
  getPlaceById,
  getAccommodationById,
  getRoomTypeById,
  getActivityById,
  calculateDayCosts,
  calculateTotalClientsAccommodated,
  addPlaceToDay,
  removePlaceFromDay,
  updateDayPlace,
  toggleActivity,
  toggleConcessionFee,
  handleAccommodationChange,
  updateRoomAllocation,
  updateItinerary,
}: SortableDayProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: day.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <AccordionItem
      key={day.id}
      value={`day-${day.id}`}
      ref={setNodeRef}
      style={style}
    >
      <AccordionTrigger className="hover:bg-green-50 px-3 md:px-4 rounded-md group">
        <div className="flex items-center gap-2 text-sm md:text-base w-full">
          <div
            className="cursor-grab opacity-40 group-hover:opacity-100 p-1 rounded hover:bg-gray-100"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </div>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Day {day.id}
          </Badge>
          <span className="font-medium truncate max-w-[150px] sm:max-w-[250px] md:max-w-none">
            {day.places.length > 0
              ? day.places
                  .map((p) => getPlaceById(p.placeId)?.name || "")
                  .filter(Boolean)
                  .join(" & ")
              : `Day ${day.id} Itinerary`}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-2 md:px-4 pt-4">
        <Card className="border-green-200">
          <CardContent className="space-y-4 md:space-y-6 pt-4 md:pt-6 px-3 md:px-6">
            {/* Places Section */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <Label className="text-base md:text-lg font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5" />
                  Places to Visit
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addPlaceToDay(day.id)}
                  className="flex items-center gap-1 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4" /> Add Place
                </Button>
              </div>

              {day.places.length === 0 && (
                <div className="text-center py-4 text-gray-500 border border-dashed rounded-md text-sm">
                  No places added. Click "Add Place" to begin.
                </div>
              )}

              {day.places.map((place, placeIndex) => (
                <div
                  key={placeIndex}
                  className="border rounded-md p-3 md:p-4 space-y-3 md:space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm md:text-base">
                      Place {placeIndex + 1}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlaceFromDay(day.id, placeIndex)}
                      className="h-8 w-8 p-0 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove place</span>
                    </Button>
                  </div>

                  {/* Place Selection */}
                  <div className="space-y-2">
                    <Label
                      htmlFor={`place-${day.id}-${placeIndex}`}
                      className="text-sm"
                    >
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
                        className="text-sm"
                      >
                        <SelectValue placeholder="Select a place to visit" />
                      </SelectTrigger>
                      <SelectContent>
                        {places.map((placeOption) => (
                          <SelectItem
                            key={placeOption.id}
                            value={placeOption.id}
                            className="text-sm"
                          >
                            {placeOption.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {place.placeId && (
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {getPlaceById(place.placeId)?.description}
                      </p>
                    )}
                  </div>

                  {/* Activities Selection */}
                  {place.placeId && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm">
                        Activities
                      </Label>
                      <div className="space-y-2">
                        {getPlaceById(place.placeId)?.activities.map(
                          (activity) => {
                            const isZanzibarPlace = place.placeId === "zanzibar";
                            return (
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
                                      className="font-medium cursor-pointer text-xs md:text-sm"
                                    >
                                      {activity.name}
                                    </label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-green-700 text-xs md:text-sm">
                                      {formatCurrency(
                                        isHighSeason
                                          ? activity.highSeasonCost
                                          : activity.lowSeasonCost
                                      )}
                                      <span className="text-xs text-gray-500 hidden sm:inline">
                                        {" "}
                                        {activity.id === "ngorongoro-crater-tour"
                                          ? "per vehicle"
                                          : isZanzibarPlace
                                          ? "per person (group discounts apply)"
                                          : "per adult"}
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
                                  <p className="text-xs md:text-sm text-gray-600">
                                    {activity.description}
                                  </p>
                                  <div className="mt-2 space-y-1">
                                    {isZanzibarPlace && (
                                      <p className="text-xs text-green-700">
                                        Note: Price per person decreases for larger groups.
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 sm:hidden">
                                      {activity.id === "ngorongoro-crater-tour"
                                        ? `Charged per vehicle (${getVehicleCount(
                                            getTotalClients()
                                          )} vehicles needed)`
                                        : "Charged per person"}
                                    </p>
                                    {activity.id === "ngorongoro-crater-tour" ? (
                                      <p className="text-xs text-green-700">
                                        Total:{" "}
                                        {formatCurrency(
                                          (isHighSeason
                                            ? activity.highSeasonCost
                                            : activity.lowSeasonCost) *
                                            getVehicleCount(getTotalClients())
                                        )}{" "}
                                        for {getVehicleCount(getTotalClients())}{" "}
                                        vehicle(s)
                                      </p>
                                    ) : (
                                      activity.id !== "ngorongoro-crater-tour" &&
                                      !isZanzibarPlace && (
                                        <p className="text-xs text-green-700">
                                          Child price:{" "}
                                          {formatCurrency(
                                            isHighSeason
                                              ? activity.childHighSeasonCost
                                              : activity.childLowSeasonCost
                                          )}{" "}
                                          per child
                                        </p>
                                      )
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            )
                          }
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Accommodation Selection */}
            <div className="space-y-3 md:space-y-4">
              <Label
                htmlFor={`accommodation-${day.id}`}
                className="text-base md:text-lg font-medium flex items-center gap-2"
              >
                <Hotel className="h-4 w-4 md:h-5 md:w-5" />
                Overnight Accommodation
              </Label>
              <Select
                value={day.selectedAccommodation || ""}
                onValueChange={(value) =>
                  handleAccommodationChange(day.id, value)
                }
              >
                <SelectTrigger
                  id={`accommodation-${day.id}`}
                  className="text-sm"
                >
                  <SelectValue placeholder="Select accommodation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-sm">
                    No accommodation (departure day)
                  </SelectItem>
                  {accommodations.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id} className="text-sm">
                      {acc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {day.selectedAccommodation &&
                day.selectedAccommodation !== "none" && (
                  <div className="space-y-3 md:space-y-4">
                    <p className="text-xs md:text-sm text-gray-500">
                      {
                        getAccommodationById(day.selectedAccommodation)
                          ?.description
                      }
                    </p>
                    <p className="text-green-700 font-medium text-xs md:text-sm">
                      Includes: Full Board (All Meals)
                    </p>

                    {/* Room Allocation */}
                    <div className="border rounded-md p-3 md:p-4 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <Bed className="h-4 w-4" />
                        <h4 className="font-medium text-sm md:text-base">
                          Room Allocation
                        </h4>
                      </div>

                      <div className="space-y-3">
                        {getAccommodationById(
                          day.selectedAccommodation
                        )?.roomTypes.map((roomType) => {
                          const allocation = day.roomAllocation.find(
                            (r) => r.roomTypeId === roomType.id
                          );
  
                          const quantity = allocation ? allocation.quantity : 0;

                          return (
                            <div
                              key={roomType.id}
                              className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0"
                            >
                              <div>
                                <p className="font-medium text-sm">
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
                                <span className="w-8 text-center text-sm">
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

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
                          <div className="text-sm">
                            <span className="font-medium">
                              Total Accommodated:
                            </span>
                            <span className="ml-2">
                              {calculateTotalClientsAccommodated(
                                day.roomAllocation,
                                day.selectedAccommodation
                              )}{" "}
                              / {getTotalClients()} clients
                            </span>
                          </div>
                          {calculateTotalClientsAccommodated(
                            day.roomAllocation,
                            day.selectedAccommodation
                          ) < getTotalClients() && (
                            <Badge
                              variant="destructive"
                              className="w-full sm:w-auto text-center"
                            >
                              Not enough rooms
                            </Badge>
                          )}
                          {calculateTotalClientsAccommodated(
                            day.roomAllocation,
                            day.selectedAccommodation
                          ) > getTotalClients() && (
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 border-amber-200 w-full sm:w-auto text-center"
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
                          onCheckedChange={() => toggleConcessionFee(day.id)}
                        />
                        <label
                          htmlFor={`concession-${day.id}`}
                          className="text-xs md:text-sm font-medium cursor-pointer"
                        >
                          Add park concession fee (${constants.CONCESSION_FEE}{" "}
                          per adult, ${constants.CHILD_CONCESSION_FEE} per
                          child)
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
                className="flex items-center gap-2 text-sm"
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
                className="text-sm"
              />
            </div>

            {/* Day Summary */}
            <div className="bg-green-50 p-3 md:p-4 rounded-md">
              <h4 className="font-medium text-green-800 mb-2 text-sm md:text-base">
                Day {day.id} Cost Summary
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs md:text-sm">
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

                {day.places.some((p) => p.selectedActivities.length > 0) && (
                  <>
                    <div>Activities:</div>
                    <div className="text-right font-medium">
                      {formatCurrency(
                        calculateDayCosts(day).totalActivitiesCost
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
                    <div>Concession Fees:</div>
                    <div className="text-right font-medium">
                      {formatCurrency(
                        calculateDayCosts(day).totalConcessionFee
                      )}
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
  );
}

export default function SafariCalculator() {
  const [days, setDays] = useState<number>(3);
  const {
    adults,
    children,
    setAdults,
    setChildren,
    getTotalClients,
    useManualVehicles,
    vehicleCount,
    setUseManualVehicles,
    setVehicleCount,
    getVehicleCount,
  } = useClientStore();

  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [profitAmount, setProfitAmount] = useState<number>(700);
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [isHighSeason, setIsHighSeason] = useState<boolean>(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [tourName, setTourName] = useState<string>("");

  // State for save/load functionality
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState<boolean>(false);
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState<boolean>(false);
  const [currentSavedItinerary, setCurrentSavedItinerary] =
    useState<SavedItinerary | null>(null);
  const { toast } = useToast();

  // State for database data
  const [places, setPlaces] = useState<Place[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [constants, setConstants] = useState({
    CONCESSION_FEE: 60,
    CHILD_CONCESSION_FEE: 30,
    VEHICLE_CAPACITY: 7,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch data from the database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/safari-data");
        if (!response.ok) {
          throw new Error("Failed to fetch safari data");
        }
        const data = await response.json();
        setPlaces(data.places);
        setAccommodations(data.accommodations);
        setConstants(data.constants);
      } catch (error) {
        console.error("Error fetching safari data:", error);
        toast({
          title: "Error",
          description: "Failed to load safari data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Initialize itinerary when days change
  useEffect(() => {
    initializeItinerary(days);
  }, [days]);

  // Update room allocations when client count changes
  useEffect(() => {
    setItinerary((prev) =>
      prev.map((day) => {
        if (day.selectedAccommodation && day.selectedAccommodation !== "none") {
          return {
            ...day,
            roomAllocation: suggestRoomAllocation(
              day.selectedAccommodation,
              getTotalClients()
            ),
          };
        }
        return day;
      })
    );
  }, [getTotalClients, isHighSeason]);

  // Modified to preserve existing data when changing days
  const initializeItinerary = (numDays: number) => {
    setItinerary((prevItinerary) => {
      // Create a new array with the desired length
      const newItinerary: DayItinerary[] = [];

      // Fill with existing data where possible
      for (let i = 0; i < numDays; i++) {
        const dayId = i + 1;
        const existingDay = prevItinerary.find((day) => day.id === dayId);

        if (existingDay) {
          // Use existing day data
          newItinerary.push(existingDay);
        } else {
          // Create new day data
          newItinerary.push({
            id: dayId,
            places: [],
            selectedAccommodation: null,
            roomAllocation: [],
            hasConcessionFee: false,
            transportationCost: 0,
            notes: "",
          });
        }
      }

      return newItinerary;
    });
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
    return places.find((place) => place.id === id) || null;
  };

  // Get accommodation by ID
  const getAccommodationById = (id: string | null) => {
    if (!id) return null;
    return accommodations.find((acc) => acc.id === id) || null;
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
    let adultActivitiesCost = 0;
    let childActivitiesCost = 0;
    let adultConcessionFee = 0;
    let childConcessionFee = 0;

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
            const isZanzibarPlace = place.placeId === 'zanzibar';

            // Special handling for Ngorongoro Crater Floor Tour - charged per vehicle
            if (activityId === "ngorongoro-crater-tour") {
              const vehiclesNeeded = getVehicleCount(getTotalClients());
              adultActivitiesCost +=
                (isHighSeason
                  ? activity.highSeasonCost
                  : activity.lowSeasonCost) * vehiclesNeeded;
            } else if (isZanzibarPlace) {
              // Handle Zanzibar's tiered pricing
              const totalClients = getTotalClients();
              const basePrice = isHighSeason ? activity.highSeasonCost : activity.lowSeasonCost;
              let pricePerPerson = basePrice;
              
              if (totalClients >= 5) {
                pricePerPerson *= 0.8; // 20% discount for 5+ people
              } else if (totalClients >= 3) {
                pricePerPerson *= 0.9; // 10% discount for 3-4 people
              }

              // Children are counted as adults for Zanzibar activities
              const zanzibarActivityCost = pricePerPerson * totalClients;
              adultActivitiesCost += zanzibarActivityCost;
            
            } else {
              // All other activities - charged per person
              adultActivitiesCost +=
                (isHighSeason
                  ? activity.highSeasonCost
                  : activity.lowSeasonCost) * adults;
              childActivitiesCost +=
                (isHighSeason
                  ? activity.childHighSeasonCost
                  : activity.childLowSeasonCost) * children;
            }
          }
        });
      }
    });

    // Concession fee if applicable
    if (day.hasConcessionFee) {
      adultConcessionFee = constants.CONCESSION_FEE * adults;
      childConcessionFee = constants.CHILD_CONCESSION_FEE * children;
    }

    const totalActivitiesCost = adultActivitiesCost + childActivitiesCost;
    const totalConcessionFee = adultConcessionFee + childConcessionFee;

    return {
      accommodationCost,
      adultActivitiesCost,
      childActivitiesCost,
      totalActivitiesCost,
      adultConcessionFee,
      childConcessionFee,
      totalConcessionFee,
      transportationCost: day.transportationCost,
      totalCost:
        accommodationCost +
        totalActivitiesCost +
        day.transportationCost +
        totalConcessionFee,
    };
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalAccommodation = 0;
    let totalAdultActivities = 0;
    let totalChildActivities = 0;
    let totalTransportation = 0;
    let totalAdultConcessionFees = 0;
    let totalChildConcessionFees = 0;

    itinerary.forEach((day) => {
      const costs = calculateDayCosts(day);
      totalAccommodation += costs.accommodationCost;
      totalAdultActivities += costs.adultActivitiesCost;
      totalChildActivities += costs.childActivitiesCost;
      totalTransportation += costs.transportationCost;
      totalAdultConcessionFees += costs.adultConcessionFee;
      totalChildConcessionFees += costs.childConcessionFee;
    });

    const totalActivities = totalAdultActivities + totalChildActivities;
    const totalConcessionFees =
      totalAdultConcessionFees + totalChildConcessionFees;
    const subtotal =
      totalAccommodation +
      totalActivities +
      totalTransportation +
      totalConcessionFees;
    const total = subtotal + profitAmount;

    let perAdult = 0;
    let perChild = 0;

    // Apply the 1:2 ratio split between adults and children
    if (adults > 0 && children > 0) {
      // Calculate based on "shares" where adults count as 2 shares, children as 1 share
      const totalShares = adults * 2 + children;
      const costPerShare = total / totalShares;

      perAdult = 2 * costPerShare;
      perChild = costPerShare;
    } else if (adults > 0) {
      // Only adults
      perAdult = total / adults;
    } else if (children > 0) {
      // Only children (unlikely case)
      perChild = total / children;
    }

    return {
      accommodation: totalAccommodation,
      adultActivities: totalAdultActivities,
      childActivities: totalChildActivities,
      activities: totalActivities,
      transportation: totalTransportation,
      adultConcessionFees: totalAdultConcessionFees,
      childConcessionFees: totalChildConcessionFees,
      concessionFees: totalConcessionFees,
      subtotal,
      profit: profitAmount,
      total,
      perAdult,
      perChild,
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

  const exportItinerary = () => {
    setIsExportDialogOpen(true);
  };

  // Update the handleExport function to include the 1:2 ratio information
  const handleExport = () => {
    const doc = new jsPDF();
    const fileName = tourName.trim() || "safari-itinerary";

    // Set title
    doc.setFontSize(20);
    doc.text(tourName || "Safari Itinerary", 20, 20);

    // Add basic info
    doc.setFontSize(12);
    doc.text(`Duration: ${days} days`, 20, 35);
    doc.text(`Number of Adults: ${adults}`, 20, 45);
    doc.text(`Number of Children (<15): ${children}`, 20, 55);
    doc.text(`Season: ${isHighSeason ? "High Season" : "Low Season"}`, 20, 65);
    doc.text(
      `Vehicles: ${getVehicleCount(getTotalClients())} ${
        useManualVehicles
          ? "(manually set)"
          : `(${constants.VEHICLE_CAPACITY} clients per vehicle)`
      }`,
      20,
      75
    );

    let yPos = 80;

    // Add itinerary details
    doc.setFontSize(16);
    doc.text("Itinerary Details:", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    itinerary.forEach((day, index) => {
      // Add day header
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFont("Arial", "bold");
      doc.text(`Day ${day.id}:`, 20, yPos);
      doc.setFont("Arial", "normal");

      // Add places
      if (day.places.length > 0) {
        yPos += 10;
        const places = day.places
          .map((p) => getPlaceById(p.placeId)?.name || "")
          .filter(Boolean)
          .join(" & ");
        doc.text(`Places: ${places}`, 30, yPos);

        // Add activities
        day.places.forEach((place) => {
          if (place.selectedActivities.length > 0) {
            yPos += 10;
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
            const activities = place.selectedActivities
              .map((actId) => getActivityById(place.placeId, actId)?.name || "")
              .filter(Boolean)
              .join(", ");
            doc.text(`Activities: ${activities}`, 30, yPos);
          }
        });
      }

      // Add accommodation
      if (day.selectedAccommodation && day.selectedAccommodation !== "none") {
        yPos += 10;
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        const accommodation = getAccommodationById(day.selectedAccommodation);
        doc.text(`Accommodation: ${accommodation?.name || ""}`, 30, yPos);

        // Add room allocation
        if (day.roomAllocation.length > 0) {
          yPos += 10;
          const rooms = day.roomAllocation
            .map((room) => {
              const roomType = getRoomTypeById(
                day.selectedAccommodation,
                room.roomTypeId
              );
              return roomType ? `${room.quantity}x ${roomType.name}` : "";
            })
            .filter(Boolean)
            .join(", ");
          doc.text(`Rooms: ${rooms}`, 40, yPos);
        }
      }

      // Add costs
      const costs = calculateDayCosts(day);
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`Day Total: ${formatCurrency(costs.totalCost)}`, 30, yPos);
    });

    // Add total costs
    yPos += 20;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("Arial", "bold");
    doc.text("Cost Summary:", 20, yPos);
    doc.setFont("Arial", "normal");

    yPos += 10;
    doc.text(`Subtotal: ${formatCurrency(totals.subtotal)}`, 30, yPos);
    yPos += 10;
    doc.text(`Profit: ${formatCurrency(totals.profit)}`, 30, yPos);
    yPos += 10;
    doc.text(`Total Cost: ${formatCurrency(totals.total)}`, 30, yPos);

    if (adults > 0 && children > 0) {
      yPos += 15;
      doc.text(
        "Price Distribution (1:2 ratio between children and adults):",
        30,
        yPos
      );
      yPos += 10;
      doc.text(`Cost Per Adult: ${formatCurrency(totals.perAdult)}`, 30, yPos);
      yPos += 10;
      doc.text(`Cost Per Child: ${formatCurrency(totals.perChild)}`, 30, yPos);
    } else {
      if (adults > 0) {
        yPos += 10;
        doc.text(
          `Cost Per Adult: ${formatCurrency(totals.perAdult)}`,
          30,
          yPos
        );
      }
      if (children > 0) {
        yPos += 10;
        doc.text(
          `Cost Per Child: ${formatCurrency(totals.perChild)}`,
          30,
          yPos
        );
      }
    }

    // Save the PDF
    doc.save(`${fileName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    setIsExportDialogOpen(false);
    setTourName("");
  };

  // Generate suggested room allocation based on number of clients
  const suggestRoomAllocation = (
    accommodationId: string | null,
    numClients: number
  ) => {
    if (!accommodationId || accommodationId === "none") return [];

    const accommodation = getAccommodationById(accommodationId);
    if (!accommodation) return [];

    // Sort room types by occupancy (descending) and then by cost per person (ascending)
    const sortedRoomTypes = [...accommodation.roomTypes].sort((a, b) => {
      if (b.maxOccupancy !== a.maxOccupancy) {
        return b.maxOccupancy - a.maxOccupancy;
      }
      const aCostPerPerson =
        (isHighSeason ? a.highSeasonCost : a.lowSeasonCost) / a.maxOccupancy;
      const bCostPerPerson =
        (isHighSeason ? b.highSeasonCost : b.lowSeasonCost) / b.maxOccupancy;
      return aCostPerPerson - bCostPerPerson;
    });

    let remainingClients = numClients;
    const allocation: RoomAllocation[] = [];

    // First pass: Fill with largest rooms possible
    for (const roomType of sortedRoomTypes) {
      if (remainingClients <= 0) break;

      const numRoomsNeeded = Math.floor(
        remainingClients / roomType.maxOccupancy
      );
      if (numRoomsNeeded > 0) {
        allocation.push({
          roomTypeId: roomType.id,
          quantity: numRoomsNeeded,
        });
        remainingClients -= numRoomsNeeded * roomType.maxOccupancy;
      }
    }

    // Second pass: Handle remaining clients
    if (remainingClients > 0) {
      // Find the smallest room type that can accommodate remaining clients
      const suitableRoom = sortedRoomTypes.find(
        (room) => room.maxOccupancy >= remainingClients
      );

      if (suitableRoom) {
        const existingAllocation = allocation.find(
          (a) => a.roomTypeId === suitableRoom.id
        );
        if (existingAllocation) {
          existingAllocation.quantity += 1;
        } else {
          allocation.push({
            roomTypeId: suitableRoom.id,
            quantity: 1,
          });
        }
      } else {
        // If no single room can accommodate remaining clients, use the largest room type
        const largestRoom = sortedRoomTypes[0];
        const existingAllocation = allocation.find(
          (a) => a.roomTypeId === largestRoom.id
        );
        if (existingAllocation) {
          existingAllocation.quantity += 1;
        } else {
          allocation.push({
            roomTypeId: largestRoom.id,
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

    const suggestedAllocation = suggestRoomAllocation(
      accommodationId,
      getTotalClients()
    );

    updateItinerary(dayId, "selectedAccommodation", accommodationId);
    updateItinerary(dayId, "roomAllocation", suggestedAllocation);
  };

  // Save itinerary to database
  const handleSaveItinerary = async (name: string) => {
    try {
      const data = {
        days,
        adults,
        children,
        profitAmount,
        isHighSeason,
        useManualVehicles,
        vehicleCount,
        itinerary,
      };

      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          data,
          id: currentSavedItinerary?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save itinerary");
      }

      const savedItinerary = await response.json();
      setCurrentSavedItinerary(savedItinerary);

      return savedItinerary;
    } catch (error) {
      console.error("Error saving itinerary:", error);
      throw error;
    }
  };

  // Load itinerary from database
  const handleLoadItinerary = (savedItinerary: SavedItinerary) => {
    try {
      const { data } = savedItinerary;

      // Update all state
      setDays(data.days);
      setAdults(data.adults);
      setChildren(data.children);
      setProfitAmount(data.profitAmount);
      setIsHighSeason(data.isHighSeason);
      setUseManualVehicles(data.useManualVehicles);
      setVehicleCount(data.vehicleCount);
      setItinerary(data.itinerary);
      setCurrentSavedItinerary(savedItinerary);

      toast({
        title: "Itinerary loaded",
        description: `Successfully loaded "${savedItinerary.name}"`,
      });
    } catch (error) {
      console.error("Error loading itinerary:", error);
      toast({
        title: "Error",
        description: "Failed to load the itinerary",
        variant: "destructive",
      });
    }
  };

  // Delete itinerary from database
  const handleDeleteItinerary = async (id: string) => {
    try {
      const response = await fetch(`/api/itinerary?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete itinerary");
      }

      // If we deleted the current itinerary, clear it
      if (currentSavedItinerary?.id === id) {
        setCurrentSavedItinerary(null);
      }
    } catch (error) {
      console.error("Error deleting itinerary:", error);
      throw error;
    }
  };

  // Handle drag end for reordering days
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItinerary((items) => {
        const oldIndex = items.findIndex(
          (item) => item.id.toString() === active.id
        );
        const newIndex = items.findIndex(
          (item) => item.id.toString() === over.id
        );

        // Create a new array with the items in the new order
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update the id property to match the new position
        return newItems.map((item, index) => ({
          ...item,
          id: index + 1,
        }));
      });
    }
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading safari data...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="setup"
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-4 md:space-y-6"
    >
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="setup">Setup</TabsTrigger>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="summary">Summary</TabsTrigger>
      </TabsList>

      {/* Setup Tab */}
      <TabsContent value="setup" className="space-y-4 md:space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-semibold text-green-800">
            {currentSavedItinerary
              ? currentSavedItinerary.name
              : "New Safari Itinerary"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaveDialogOpen(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              {currentSavedItinerary ? "Update" : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoadDialogOpen(true)}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Load
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-2 md:pb-4">
            <CardTitle className="text-xl md:text-2xl">
              Safari Details
            </CardTitle>
            <CardDescription>
              Enter the basic information about your safari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="grid gap-4 md:gap-6 md:grid-cols-3">
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
                <Label htmlFor="adults" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Adults
                </Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  value={adults}
                  onChange={(e) =>
                    setAdults(Number.parseInt(e.target.value) || 1)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children" className="flex items-center gap-2">
                  <Child className="h-4 w-4" />
                  Children (Under 15)
                </Label>
                <Input
                  id="children"
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) =>
                    setChildren(Number.parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-3">
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

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Car className="h-4 w-4" />
                <h4 className="font-medium">Vehicle Information</h4>
              </div>

              {/* Vehicle Mode Selection */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                <Label
                  htmlFor="vehicle-toggle"
                  className="mb-1 sm:mb-0 text-sm"
                >
                  Vehicle Calculation:
                </Label>
                <div className="flex items-center space-x-2">
                  <span
                    className={
                      !useManualVehicles
                        ? "font-medium text-sm"
                        : "text-gray-500 text-sm"
                    }
                  >
                    Automatic
                  </span>
                  <Switch
                    id="vehicle-toggle"
                    checked={useManualVehicles}
                    onCheckedChange={setUseManualVehicles}
                  />
                  <span
                    className={
                      useManualVehicles
                        ? "font-medium text-sm"
                        : "text-gray-500 text-sm"
                    }
                  >
                    Manual
                  </span>
                </div>
              </div>

              {/* Show appropriate vehicle information based on mode */}
              {useManualVehicles ? (
                <div className="space-y-2">
                  <Label htmlFor="vehicle-count" className="text-sm">
                    Number of Vehicles
                  </Label>
                  <Input
                    id="vehicle-count"
                    type="number"
                    min="1"
                    value={vehicleCount}
                    onChange={(e) =>
                      setVehicleCount(
                        Math.max(1, Number.parseInt(e.target.value) || 1)
                      )
                    }
                    className="max-w-[150px]"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  Each vehicle can accommodate up to{" "}
                  {constants.VEHICLE_CAPACITY} clients. Your group will require{" "}
                  <span className="font-bold">
                    {getVehicleCount(getTotalClients())}
                  </span>{" "}
                  vehicle(s).
                </p>
              )}

              <p className="text-sm text-gray-600 mt-2">
                Note: Ngorongoro Crater Floor Tour is charged per vehicle.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <Label htmlFor="season-toggle" className="mb-1 sm:mb-0">
                Season:
              </Label>
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
      <TabsContent value="itinerary" className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h2 className="text-xl md:text-2xl font-semibold text-green-800">
            Day by Day Itinerary
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab("setup")}
              className="w-full sm:w-auto"
            >
              Back to Setup
            </Button>
            <Button
              onClick={() => setActiveTab("summary")}
              className="w-full sm:w-auto"
            >
              Continue to Summary
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4">
          <Label htmlFor="season-toggle-2" className="mb-1 sm:mb-0">
            Season:
          </Label>
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Accordion type="single" collapsible className="w-full">
            <SortableContext
              items={itinerary.map((day) => day.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              {itinerary.map((day) => (
                <SortableDayItem
                  key={day.id}
                  day={day}
                  places={places}
                  accommodations={accommodations}
                  isHighSeason={isHighSeason}
                  constants={constants}
                  getTotalClients={getTotalClients}
                  getVehicleCount={getVehicleCount}
                  formatCurrency={formatCurrency}
                  getPlaceById={getPlaceById}
                  getAccommodationById={getAccommodationById}
                  getRoomTypeById={getRoomTypeById}
                  getActivityById={getActivityById}
                  calculateDayCosts={calculateDayCosts}
                  calculateTotalClientsAccommodated={
                    calculateTotalClientsAccommodated
                  }
                  addPlaceToDay={addPlaceToDay}
                  removePlaceFromDay={removePlaceFromDay}
                  updateDayPlace={updateDayPlace}
                  toggleActivity={toggleActivity}
                  toggleConcessionFee={toggleConcessionFee}
                  handleAccommodationChange={handleAccommodationChange}
                  updateRoomAllocation={updateRoomAllocation}
                  updateItinerary={updateItinerary}
                />
              ))}
            </SortableContext>
          </Accordion>
        </DndContext>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveTab("setup")}
            className="w-full sm:w-auto"
          >
            Back to Setup
          </Button>
          <Button
            onClick={() => setActiveTab("summary")}
            className="w-full sm:w-auto"
          >
            Continue to Summary
          </Button>
        </div>
      </TabsContent>

      {/* Summary Tab */}
      <TabsContent value="summary" className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <h2 className="text-xl md:text-2xl font-semibold text-green-800">
            Safari Cost Summary
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab("itinerary")}
              className="w-full sm:w-auto"
            >
              Back to Itinerary
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsSaveDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {currentSavedItinerary ? "Update" : "Save"}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  Export Safari Itinerary
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Export Itinerary</h3>
                  <p className="text-sm text-gray-500">
                    Enter a name for the tour to be used as the file name.
                  </p>
                  <div>
                    <Label htmlFor="tour-name">Tour Name</Label>
                    <Input
                      id="tour-name"
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      placeholder="Safari Tour"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => setIsExportDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleExport}>Export</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of all costs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>Accommodation:</div>
                <div className="text-right">
                  {formatCurrency(totals.accommodation)}
                </div>

                <div>Activities:</div>
                <div className="text-right">
                  {formatCurrency(totals.activities)}
                </div>

                <div>Transportation:</div>
                <div className="text-right">
                  {formatCurrency(totals.transportation)}
                </div>

                <div>Concession Fees:</div>
                <div className="text-right">
                  {formatCurrency(totals.concessionFees)}
                </div>

                <Separator className="col-span-2" />

                <div className="font-medium">Subtotal:</div>
                <div className="text-right font-medium">
                  {formatCurrency(totals.subtotal)}
                </div>

                <div>Profit:</div>
                <div className="text-right">
                  {formatCurrency(totals.profit)}
                </div>

                <Separator className="col-span-2" />

                <div className="font-bold">Total:</div>
                <div className="text-right font-bold">
                  {formatCurrency(totals.total)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost Per Person</CardTitle>
              <CardDescription>
                {adults > 0 && children > 0
                  ? "Prices split in a 1:2 ratio (children:adults)"
                  : "Average cost per person"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {adults > 0 && (
                  <>
                    <div>Cost Per Adult:</div>
                    <div className="text-right">
                      {formatCurrency(totals.perAdult)}
                    </div>
                  </>
                )}

                {children > 0 && (
                  <>
                    <div>Cost Per Child:</div>
                    <div className="text-right">
                      {formatCurrency(totals.perChild)}
                    </div>
                  </>
                )}

                {adults > 0 && children > 0 && (
                  <>
                    <div className="col-span-2 mt-2 text-sm text-gray-600">
                      Adults pay twice as much as children, making this a
                      family-friendly pricing option.
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>
                Number of vehicles required for your safari
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>Total Clients:</div>
                  <div className="text-right">
                    {getTotalClients()} ({adults} adults, {children} children)
                  </div>

                  {!useManualVehicles && (
                    <>
                      <div>Vehicle Capacity:</div>
                      <div className="text-right">
                        {constants.VEHICLE_CAPACITY} clients per vehicle
                      </div>
                    </>
                  )}

                  <div className="font-medium">Vehicles Required:</div>
                  <div className="text-right font-medium">
                    {getVehicleCount(getTotalClients())}
                    {useManualVehicles && " (manually set)"}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded-md">
                  <p>
                    Note: The Ngorongoro Crater Floor Tour is charged per
                    vehicle. Each vehicle can enter the crater with its own
                    guide and permit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Save Itinerary Dialog */}
      <SaveItineraryDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onSave={handleSaveItinerary}
        currentItinerary={currentSavedItinerary}
      />

      {/* Load Itinerary Dialog */}
      <LoadItineraryDialog
        open={isLoadDialogOpen}
        onOpenChange={setIsLoadDialogOpen}
        onLoad={handleLoadItinerary}
        onDelete={handleDeleteItinerary}
      />
    </Tabs>
  );
}
