
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
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import {
  Compass,
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
  CheckCircle2,
  Clock,
  Settings2,
  Layers,
  Sparkles,
  Search,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
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
import { saveItineraryAction, deleteItineraryAction } from "@/lib/actions";
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

// Sub-component for destination selection to manage local state
function PlaceSelector({
  place,
  places,
  dayId,
  placeIndex,
  updateDayPlace
}: {
  place: { placeId: string },
  places: Place[],
  dayId: number,
  placeIndex: number,
  updateDayPlace: (dayId: number, placeIndex: number, placeId: string) => void
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-11 border-primary/10 hover:bg-white focus:ring-primary/20 font-medium text-left"
        >
          <span className="truncate">
            {place.placeId
              ? places.find((p) => p.id === place.placeId)?.name
              : "Select Destination..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-32px)] md:w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search destination..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No destination found.</CommandEmpty>
            <CommandGroup>
              {places.map((placeOption) => (
                <CommandItem
                  key={placeOption.id}
                  value={placeOption.name}
                  onSelect={() => {
                    updateDayPlace(dayId, placeIndex, placeOption.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      place.placeId === placeOption.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{placeOption.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{placeOption.description || "Safari destination"}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Sub-component for accommodation selection to manage local state
function AccommodationSelector({
  selectedId,
  accommodations,
  onSelect
}: {
  selectedId: string | null,
  accommodations: Accommodation[],
  onSelect: (value: string) => void
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 border-primary/10 hover:bg-white focus:ring-primary/20 font-medium text-left"
        >
          <span className="truncate">
            {selectedId && selectedId !== "none"
              ? accommodations.find((a) => a.id === selectedId)?.name
              : selectedId === "none" ? "No accommodation needed" : "Browse Accommodations..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-32px)] md:w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search accommodation..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No accommodation found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="none"
                onSelect={() => {
                  onSelect("none");
                  setOpen(false);
                }}
                className="text-destructive font-semibold"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedId === "none" ? "opacity-100" : "opacity-0"
                  )}
                />
                No accommodation needed
              </CommandItem>
              {accommodations.map((acc) => (
                <CommandItem
                  key={acc.id}
                  value={acc.name}
                  onSelect={() => {
                    onSelect(acc.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedId === acc.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{acc.name}</span>
                      {acc.inPark && <Badge variant="outline" className="text-[9px] h-4 py-0 bg-emerald-50 text-emerald-700 border-emerald-100">In-Park</Badge>}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[300px]">{acc.description}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
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
      <AccordionTrigger className="hover:bg-primary/5 px-4 md:px-6 rounded-xl group transition-all duration-200 border-transparent hover:border-primary/20 border mb-2">
        <div className="flex items-center gap-4 text-sm md:text-base w-full py-2">
          <div
            className="cursor-grab opacity-40 group-hover:opacity-100 p-2 rounded-lg hover:bg-primary/10 transition-colors"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-start gap-1 flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-2 py-0 h-6 font-bold"
              >
                Day {day.id}
              </Badge>
              <span className="font-bold text-lg truncate tracking-tight">
                {day.places.length > 0
                  ? day.places
                    .map((p) => getPlaceById(p.placeId)?.name || "")
                    .filter(Boolean)
                    .join(" → ")
                  : "Unassigned Destination"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Hotel className="h-3 w-3" />
                {day.selectedAccommodation && day.selectedAccommodation !== "none"
                  ? getAccommodationById(day.selectedAccommodation)?.name
                  : "No Stay Recorded"}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(calculateDayCosts(day).totalCost)} Total
              </span>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-1 md:px-4 pt-2">
        <Card className="border-primary/10 shadow-lg overflow-hidden bg-white/50 dark:bg-card/50 backdrop-blur-sm">
          <CardContent className="space-y-6 pt-6 px-4 md:px-8 pb-8">
            {/* Places Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col">
                  <Label className="text-lg font-bold flex items-center gap-2 text-primary">
                    <MapPin className="h-5 w-5" />
                    Destinations & Expedition
                  </Label>
                  <p className="text-xs text-muted-foreground ml-7 italic">Select the key locations for this day's journey.</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => addPlaceToDay(day.id)}
                  className="flex items-center gap-1.5 shadow-sm border border-primary/10 hover:bg-primary/10 h-9 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Milestone
                </Button>
              </div>

              {day.places.length === 0 && (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/30">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Ready for your itinerary. Add a place to start planning.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {day.places.map((place, placeIndex) => (
                  <div
                    key={placeIndex}
                    className="relative group/place border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-all border-primary/5 hover:border-primary/20"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePlaceFromDay(day.id, placeIndex)}
                      className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white dark:bg-card border shadow-sm text-destructive hover:bg-destructive/10 hover:text-destructive p-0 z-10 opacity-0 group-hover/place:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-primary/5 text-primary border-none font-medium h-5">#{placeIndex + 1}</Badge>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Location</span>
                      </div>

                      <PlaceSelector
                        place={place}
                        places={places}
                        dayId={day.id}
                        placeIndex={placeIndex}
                        updateDayPlace={updateDayPlace}
                      />

                      {place.placeId && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold uppercase tracking-wider">Curated Activities</span>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {getPlaceById(place.placeId)?.activities.map((activity) => {
                              const isZanzibarPlace = place.placeId === "zanzibar";
                              const isChecked = place.selectedActivities.includes(activity.id);
                              return (
                                <div
                                  key={activity.id}
                                  className={`flex flex-col border rounded-lg transition-all ${isChecked ? 'border-primary/30 bg-primary/5' : 'border-transparent bg-muted/20 hover:bg-muted/40'}`}
                                >
                                  <div className="flex items-center justify-between p-2.5">
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        id={`activity-${day.id}-${placeIndex}-${activity.id}`}
                                        checked={isChecked}
                                        onCheckedChange={() => toggleActivity(day.id, placeIndex, activity.id)}
                                        className="data-[state=checked]:bg-primary"
                                      />
                                      <label
                                        htmlFor={`activity-${day.id}-${placeIndex}-${activity.id}`}
                                        className="font-bold text-sm cursor-pointer select-none leading-none"
                                      >
                                        {activity.name}
                                      </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-xs text-primary">
                                        {formatCurrency(
                                          isHighSeason ? activity.highSeasonCost : activity.lowSeasonCost
                                        )}
                                      </span>
                                      <Collapsible>
                                        <CollapsibleTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full hover:bg-primary/10">
                                            <Clock className="h-3 w-3 opacity-50" />
                                          </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="pt-2 px-1">
                                          <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                                            {activity.description}
                                          </p>
                                        </CollapsibleContent>
                                      </Collapsible>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-primary/5" />

            {/* Accommodation Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label
                    htmlFor={`accommodation-${day.id}`}
                    className="text-lg font-bold flex items-center gap-2 text-primary"
                  >
                    <Hotel className="h-5 w-5" />
                    Overnight Sanctuary
                  </Label>
                  <p className="text-xs text-muted-foreground ml-7 italic">Where the day's journey ends in comfort.</p>
                </div>

                <AccommodationSelector
                  selectedId={day.selectedAccommodation}
                  accommodations={accommodations}
                  onSelect={(value) => handleAccommodationChange(day.id, value)}
                />

                {day.selectedAccommodation && day.selectedAccommodation !== "none" && (
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-wide">Included: Full Board Dining Suite</span>
                    </div>

                    {getAccommodationById(day.selectedAccommodation)?.inPark && (
                      <div className="flex items-center space-x-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                        <Checkbox
                          id={`concession-${day.id}`}
                          checked={day.hasConcessionFee}
                          onCheckedChange={() => toggleConcessionFee(day.id)}
                          className="data-[state=checked]:bg-amber-600"
                        />
                        <label
                          htmlFor={`concession-${day.id}`}
                          className="text-xs font-semibold cursor-pointer text-amber-900 dark:text-amber-200"
                        >
                          Apply Sanctuary Conservation Fee (${constants.CONCESSION_FEE}/guest)
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Room Allocation */}
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label className="text-lg font-bold flex items-center gap-2 text-primary">
                    <Bed className="h-5 w-5" />
                    Bespoke Suite Selection
                  </Label>
                  <p className="text-xs text-muted-foreground ml-7 italic">Customize the sleeping arrangements.</p>
                </div>

                {day.selectedAccommodation && day.selectedAccommodation !== "none" ? (
                  <div className="border rounded-xl p-5 bg-card/50 shadow-inner space-y-4">
                    {getAccommodationById(day.selectedAccommodation)?.roomTypes.map((roomType) => {
                      const allocation = day.roomAllocation.find((r) => r.roomTypeId === roomType.id);
                      const quantity = allocation ? allocation.quantity : 0;

                      return (
                        <div key={roomType.id} className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{roomType.name}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5" /> Max {roomType.maxOccupancy}</span>
                              <span>•</span>
                              <span className="text-primary/80 font-bold">{formatCurrency(isHighSeason ? roomType.highSeasonCost : roomType.lowSeasonCost)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-white dark:hover:bg-card"
                              onClick={() => updateRoomAllocation(day.id, roomType.id, Math.max(0, quantity - 1))}
                            >
                              -
                            </Button>
                            <span className="w-6 text-center text-xs font-black">{quantity}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-white dark:hover:bg-card"
                              onClick={() => updateRoomAllocation(day.id, roomType.id, quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="pt-3 border-t flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Allocation status </span>
                        <span className="font-black text-primary ml-1">
                          {calculateTotalClientsAccommodated(day.roomAllocation, day.selectedAccommodation)} / {getTotalClients()}
                        </span>
                      </div>
                      {calculateTotalClientsAccommodated(day.roomAllocation, day.selectedAccommodation) < getTotalClients() ? (
                        <Badge variant="destructive" className="h-5 text-[9px] uppercase tracking-widest font-black">Capacity Gap</Badge>
                      ) : (
                        <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-black text-green-600 bg-green-50 border-green-200">Confirmed</Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/20">
                    <p className="text-xs text-muted-foreground font-medium italic">Select an accommodation to manage suites.</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-primary/5" />

            {/* Logistics & Valuation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
              <div className="lg:col-span-4 space-y-2">
                <Label htmlFor={`transportation-cost-${day.id}`} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <Car className="h-3.5 w-3.5" />
                  Fleet Positioning ($)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id={`transportation-cost-${day.id}`}
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={day.transportationCost || ""}
                    onChange={(e) => updateItinerary(day.id, "transportationCost", Number.parseFloat(e.target.value) || 0)}
                    className="pl-8 h-10 font-bold"
                  />
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="bg-primary p-1 rounded-xl shadow-lg shadow-primary/10 overflow-hidden">
                  <div className="bg-card dark:bg-card/90 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 border border-primary/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/60 mb-0.5">End of Day Valuation</span>
                      <h4 className="text-2xl font-black tracking-tighter text-primary">
                        {formatCurrency(calculateDayCosts(day).totalCost)}
                      </h4>
                    </div>
                    <div className="flex gap-4 text-right">
                      <div className="hidden sm:flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Accom.</span>
                        <span className="text-xs font-black">{formatCurrency(calculateDayCosts(day).accommodationCost)}</span>
                      </div>
                      <div className="hidden sm:flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Activity</span>
                        <span className="text-xs font-black">{formatCurrency(calculateDayCosts(day).totalActivitiesCost)}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase text-muted-foreground">Expedition</span>
                        <span className="text-xs font-black">{formatCurrency(day.transportationCost)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
}

interface SafariCalculatorProps {
  initialPlaces?: Place[];
  initialAccommodations?: Accommodation[];
  initialConstants?: {
    CONCESSION_FEE: number;
    CHILD_CONCESSION_FEE: number;
    VEHICLE_CAPACITY: number;
  };
}

export default function SafariCalculator({
  initialPlaces = [],
  initialAccommodations = [],
  initialConstants = {
    CONCESSION_FEE: 59,
    CHILD_CONCESSION_FEE: 11.8,
    VEHICLE_CAPACITY: 7,
  },
}: SafariCalculatorProps) {
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
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [accommodations, setAccommodations] = useState<Accommodation[]>(
    initialAccommodations
  );
  const [constants, setConstants] = useState(initialConstants);
  const [isLoading, setIsLoading] = useState(false);

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

  // No longer need client-side fetch on mount

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
  }, [adults, children, isHighSeason]);

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
              // Handle Zanzibar's tiered pricing with activity-specific discounts
              const totalClients = getTotalClients();
              const basePrice = isHighSeason ? activity.highSeasonCost : activity.lowSeasonCost;

              let discountMultiplier = 1; // No discount by default

              // Define specific discounts for different Zanzibar activities
              switch (activityId) {
                case 'zanzibar-stone-town':
                  if (totalClients >= 6) discountMultiplier = 0.75; // 25% off for 6+ people
                  else if (totalClients >= 3) discountMultiplier = 0.85; // 15% off for 3-5 people
                  break;
                case 'zanzibar-spice-tour':
                  if (totalClients >= 9) discountMultiplier = 0.80; // 20% off for 9+ people
                  else if (totalClients >= 5) discountMultiplier = 0.90; // 10% off for 5-8 people
                  break;
                case 'zanzibar-snorking-boat':
                  if (totalClients >= 7) discountMultiplier = 0.85; // 15% off for 7+ people
                  else if (totalClients >= 4) discountMultiplier = 0.90; // 10% off for 4-6 people
                  break;
                case 'nungwi-beach':
                  if (totalClients >= 5) discountMultiplier = 0.90; // 10% off for 5+ people
                  else if (totalClients >= 3) discountMultiplier = 0.95; // 5% off for 3-4 people
                  break;
                default:
                  // A generic fallback for any other Zanzibar activities you might add
                  if (totalClients >= 5) discountMultiplier = 0.90; // 10% discount
                  else if (totalClients >= 3) discountMultiplier = 0.95; // 5% discount
                  break;
              }

              const pricePerPerson = basePrice * discountMultiplier;

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

  const exportToCSV = () => {
    try {
      const headers = ["Day", "Destinations", "Accommodation", "Activities", "Daily Total"];
      const rows = itinerary.map(day => {
        const placesStr = day.places.map(p => getPlaceById(p.placeId)?.name).join(" / ");
        const acc = getAccommodationById(day.selectedAccommodation)?.name || "Not Selected";
        const activities = day.places.flatMap(p =>
          p.selectedActivities.map(aId => getActivityById(p.placeId, aId)?.name)
        ).join(", ");
        const costs = calculateDayCosts(day);
        return [
          `Day ${day.id}`,
          `"${placesStr}"`,
          `"${acc}"`,
          `"${activities}"`,
          formatCurrency(costs.totalCost)
        ];
      });

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${tourName.trim() || 'safari'}_itinerary.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export Successful",
        description: "Your itinerary has been exported to CSV.",
      });
    } catch (e) {
      toast({
        title: "Export Failed",
        description: "There was an error generating the CSV.",
        variant: "destructive"
      });
    }
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
      `Vehicles: ${getVehicleCount(getTotalClients())} ${useManualVehicles
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

      const savedItinerary = await saveItineraryAction(
        name,
        data,
        currentSavedItinerary?.id
      );

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
      const success = await deleteItineraryAction(id);

      if (!success) {
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
    <div className="min-h-screen bg-stone-50/50 p-3 md:p-8 font-sans selection:bg-primary/10">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-10">
        <Tabs
          defaultValue="setup"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 md:space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full h-14 p-1.5 bg-muted/50 rounded-2xl border shadow-inner">
            <TabsTrigger
              value="setup"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-sm tracking-tight"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              Configuration
            </TabsTrigger>
            <TabsTrigger
              value="itinerary"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-sm tracking-tight"
            >
              <Layers className="h-4 w-4 mr-2" />
              Itinerary Architecture
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="rounded-xl data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg transition-all font-bold text-sm tracking-tight"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Financial Briefing
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-card p-6 rounded-xl border shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Compass className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {currentSavedItinerary
                      ? currentSavedItinerary.name
                      : "New Adventure Plan"}
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  Craft your perfect safari experience with precision.
                </p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none h-11 shadow-sm hover:bg-secondary transition-colors"
                  onClick={() => setIsLoadDialogOpen(true)}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  Load Library
                </Button>
                <Button
                  className="flex-1 md:flex-none h-11 bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
                  onClick={() => setIsSaveDialogOpen(true)}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {currentSavedItinerary ? "Update Draft" : "Save Plan"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-12">
                <Card className="border-none shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      {/* Stats Summary Panel */}
                      <div className="md:col-span-2 lg:col-span-1 border rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                            <Settings2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          </div>
                          <span className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Global Configuration</span>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="days" className="text-sm font-medium">Duration</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="days"
                                type="number"
                                min="1"
                                value={days}
                                onChange={handleDaysChange}
                                className="pl-9 h-10 transition-all focus:ring-2 focus:ring-primary/20"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-dashed">
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">Seasonality</span>
                              <span className="text-sm font-bold">{isHighSeason ? "Premium High" : "Valuable Low"}</span>
                            </div>
                            <Switch
                              id="season-toggle"
                              checked={isHighSeason}
                              onCheckedChange={setIsHighSeason}
                              className="data-[state=checked]:bg-primary"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Travelers Panel */}
                      <div className="md:col-span-2 lg:col-span-1 border rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                            <Users className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                          </div>
                          <span className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Guest Composition</span>
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="adults" className="text-xs">Adults</Label>
                              <Input
                                id="adults"
                                type="number"
                                min="1"
                                value={adults}
                                onChange={(e) => setAdults(Number.parseInt(e.target.value) || 1)}
                                className="h-10 text-center font-semibold"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="children" className="text-xs">Children</Label>
                              <Input
                                id="children"
                                type="number"
                                min="0"
                                value={children}
                                onChange={(e) => setChildren(Number.parseInt(e.target.value) || 0)}
                                className="h-10 text-center font-semibold"
                              />
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-400">
                              <span>Total Party:</span>
                              <span className="font-bold text-sm tracking-widest">{getTotalClients()} Members</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Logistics Panel */}
                      <div className="md:col-span-2 lg:col-span-1 border rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-md">
                            <Car className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                          </div>
                          <span className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Expedition Fleet</span>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                            <Label className="text-xs font-medium cursor-pointer" htmlFor="vehicle-toggle">System Guided</Label>
                            <Switch
                              id="vehicle-toggle"
                              checked={useManualVehicles}
                              onCheckedChange={setUseManualVehicles}
                            />
                            <Label className="text-xs font-medium cursor-pointer" htmlFor="vehicle-toggle">Manual overrides</Label>
                          </div>

                          {useManualVehicles ? (
                            <Input
                              type="number"
                              min="1"
                              value={vehicleCount}
                              onChange={(e) => setVehicleCount(Math.max(1, Number.parseInt(e.target.value) || 1))}
                              className="h-10 text-center font-bold"
                            />
                          ) : (
                            <div className="p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/30 text-center">
                              <span className="text-xl font-bold text-amber-700 dark:text-amber-400">{getVehicleCount(getTotalClients())}</span>
                              <span className="text-[10px] block uppercase font-semibold text-amber-600/70">Vehicles Required</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Financials Panel */}
                      <div className="md:col-span-2 lg:col-span-1 border rounded-xl p-5 bg-card shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md">
                            <DollarSign className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          </div>
                          <span className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">Management Fee</span>
                        </div>

                        <div className="space-y-4">
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="profit"
                              type="number"
                              min="0"
                              value={profitAmount}
                              onChange={(e) => setProfitAmount(Number.parseInt(e.target.value) || 0)}
                              className="pl-9 h-11 font-bold text-lg"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            <span>Applied to grand total as fixed margin</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                onClick={() => setActiveTab("itinerary")}
                className="px-10 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-lg hover:shadow-primary/20 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
              >
                Initialize Plan Architecture
                <Compass className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </TabsContent>

          {/* Itinerary Tab */}
          <TabsContent value="itinerary" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-2xl border shadow-sm">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">Sequence of Exploration</h2>
                </div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Arrange and refine each milestone of the safari journey.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-secondary/50 p-2 rounded-xl border border-dashed">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Season Mode</span>
                  <span className="text-xs font-bold">{isHighSeason ? "Premium High" : "Valuable Low"}</span>
                </div>
                <Switch
                  id="season-toggle-2"
                  checked={isHighSeason}
                  onCheckedChange={setIsHighSeason}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Accordion type="single" collapsible className="space-y-3">
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

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 mt-6 border-t border-dashed">
              <Button
                variant="ghost"
                onClick={() => setActiveTab("setup")}
                className="w-full sm:w-auto h-12 text-muted-foreground hover:text-foreground font-semibold"
              >
                ← Back to Configuration
              </Button>
              <Button
                size="lg"
                onClick={() => setActiveTab("summary")}
                className="w-full sm:w-auto h-14 px-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl transition-all hover:translate-x-[4px]"
              >
                Complete Itinerary Analysis
                <CheckCircle2 className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-8 rounded-3xl border shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tighter">Expedition Financial Briefing</h2>
                </div>
                <p className="text-muted-foreground flex items-center gap-2 font-medium">
                  <Search className="h-4 w-4 text-primary" />
                  Comprehensive breakdown of your curated safari architecture.
                </p>
              </div>
              <div className="relative z-10 flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 rounded-full border-primary/20 hover:bg-primary/5 font-bold transition-all shadow-sm"
                  onClick={exportToCSV}
                >
                  <FileDown className="h-5 w-5 mr-3 text-primary" />
                  Export Brief
                </Button>
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 font-bold shadow-xl">
                      Bespoke PDF Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] rounded-3xl border-primary/10">
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black tracking-tight">Expedition Charter</h3>
                        <p className="text-sm text-muted-foreground">
                          Define the title for your curated safari itinerary.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tour-name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expedition Title</Label>
                        <Input
                          id="tour-name"
                          value={tourName}
                          onChange={(e) => setTourName(e.target.value)}
                          placeholder="e.g. Serengeti Majestic Trails"
                          className="h-12 border-primary/10"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button
                          variant="ghost"
                          onClick={() => setIsExportDialogOpen(false)}
                          className="font-bold"
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleExport} className="font-bold bg-primary px-8">Confirm Export</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none bg-primary shadow-xl shadow-primary/10 overflow-hidden group">
                <CardContent className="p-8 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-16 w-16 text-white" />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-primary-foreground/60">Total Balanced Investment</span>
                    <div className="flex flex-col">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {formatCurrency(totals.total)}
                      </span>
                      <p className="text-xs text-primary-foreground/80 mt-2 font-medium">Standard currency: USD</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">Allocation Per Adult</span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-foreground tracking-tighter">
                        {formatCurrency(totals.perAdult)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-2 font-medium capitalize">Drafted for {adults} Leaders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card shadow-md hover:shadow-lg transition-all">
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground">Logistics Efficiency</span>
                    <div className="flex flex-col">
                      <span className="text-3xl font-black text-foreground tracking-tighter">
                        {getVehicleCount(getTotalClients())} Units
                      </span>
                      <p className="text-xs text-muted-foreground mt-2 font-medium">Optimized Expedition Fleet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-primary/5 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Layers className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Structured Cost Components</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-primary/5">
                    <div className="p-6 flex justify-between items-center group hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center">
                          <Hotel className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Accommodation Portfolio</p>
                          <p className="text-xs text-muted-foreground">Full board stay across all locations</p>
                        </div>
                      </div>
                      <span className="font-black text-lg">{formatCurrency(totals.accommodation)}</span>
                    </div>

                    <div className="p-6 flex justify-between items-center group hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center">
                          <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Experience & Activities</p>
                          <p className="text-xs text-muted-foreground">Curated safaris and excursions</p>
                        </div>
                      </div>
                      <span className="font-black text-lg">{formatCurrency(totals.activities)}</span>
                    </div>

                    <div className="p-6 flex justify-between items-center group hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center">
                          <Car className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Expedition Logistics</p>
                          <p className="text-xs text-muted-foreground">Vehicles, positioning and fleet costs</p>
                        </div>
                      </div>
                      <span className="font-black text-lg">{formatCurrency(totals.transportation)}</span>
                    </div>

                    <div className="p-6 flex justify-between items-center group hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Professional Management</p>
                          <p className="text-xs text-muted-foreground">Coordination and profit margin</p>
                        </div>
                      </div>
                      <span className="font-black text-lg">{formatCurrency(totals.profit)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/5 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Compass className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight">Expedition Schedule Brief</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/20 border border-primary/5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block mb-1">Duration</span>
                        <span className="text-lg font-black">{days} Days / {days - 1} Nights</span>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/20 border border-primary/5">
                        <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block mb-1">Season</span>
                        <span className="text-lg font-black">{isHighSeason ? "High Season" : "Low Season"}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest block">Operational Timeline</span>
                      <div className="relative pl-6 border-l-2 border-primary/20 space-y-6">
                        {itinerary.slice(0, 3).map((day, i) => (
                          <div key={day.id} className="relative">
                            <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-4 border-card bg-primary shadow-sm" />
                            <div>
                              <p className="text-xs font-black uppercase text-primary mb-0.5">Day {day.id}</p>
                              <p className="text-sm font-bold truncate">
                                {day.places.length > 0
                                  ? day.places.map(p => getPlaceById(p.placeId)?.name).join(" → ")
                                  : "Exploration day"}
                              </p>
                            </div>
                          </div>
                        ))}
                        {itinerary.length > 3 && (
                          <div className="relative pt-2">
                            <div className="absolute -left-[27px] top-4 h-2 w-2 rounded-full bg-muted-foreground/30" />
                            <p className="text-xs text-muted-foreground font-medium italic">Continuing for {itinerary.length - 3} additional days...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="p-6 bg-primary/5 border-t border-primary/5 flex items-center justify-between">
                  <span className="text-sm font-bold">Comprehensive Analysis Complete</span>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setActiveTab("itinerary")}
                className="h-14 px-8 rounded-full text-muted-foreground hover:text-foreground font-bold"
              >
                ← Adjust Itinerary Architecture
              </Button>
              <Button
                size="lg"
                onClick={() => setIsSaveDialogOpen(true)}
                className="h-14 px-12 rounded-full bg-card hover:bg-muted border-primary/10 text-primary font-black text-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {currentSavedItinerary ? "Update Exploration" : "Preserve Drafting"}
                <Save className="ml-3 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                className="h-14 px-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Finalize Expedition Drafting
                <Compass className="ml-3 h-6 w-6" />
              </Button>
            </div>
          </TabsContent>

          <SaveItineraryDialog
            open={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
            onSave={handleSaveItinerary}
            currentItinerary={currentSavedItinerary}
          />

          <LoadItineraryDialog
            open={isLoadDialogOpen}
            onOpenChange={setIsLoadDialogOpen}
            onLoad={handleLoadItinerary}
            onDelete={handleDeleteItinerary}
          />
        </Tabs>
      </div>
    </div>
  );
}
