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
import { jsPDF } from "jspdf";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DayItinerary, Place, RoomAllocation } from "@/types";
import { ACCOMMODATIONS, CONCESSION_FEE, PLACES } from "@/lib/data";
import { useClientStore } from "@/lib/store";
export default function SafariCalculator() {
  const [days, setDays] = useState<number>(3);
  const { clients, setClients } = useClientStore();
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);
  const [profitAmount, setProfitAmount] = useState<number>(500);
  const [activeTab, setActiveTab] = useState<string>("setup");
  const [isHighSeason, setIsHighSeason] = useState<boolean>(true);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState<boolean>(false);
  const [tourName, setTourName] = useState<string>("");

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
              clients
            ),
          };
        }
        return day;
      })
    );
  }, [clients]); // Now this effect depends on the clients from the store

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
            // Special handling for Ngorongoro Crater Floor Tour - charged per group
            if (activityId === "ngorongoro-crater-tour") {
              activitiesCost += isHighSeason
                ? activity.highSeasonCost
                : activity.lowSeasonCost;
            } else {
              // All other activities - charged per person
              activitiesCost +=
                (isHighSeason
                  ? activity.highSeasonCost
                  : activity.lowSeasonCost) * clients;
            }
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

  const exportItinerary = () => {
    setIsExportDialogOpen(true);
  };

  const handleExport = () => {
    const doc = new jsPDF();
    const fileName = tourName.trim() || "safari-itinerary";

    // Set title
    doc.setFontSize(20);
    doc.text(tourName || "Safari Itinerary", 20, 20);

    // Add basic info
    doc.setFontSize(12);
    doc.text(`Duration: ${days} days`, 20, 35);
    doc.text(`Number of Clients: ${clients}`, 20, 45);
    doc.text(`Season: ${isHighSeason ? "High Season" : "Low Season"}`, 20, 55);

    let yPos = 70;

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
    yPos += 10;
    doc.text(`Cost Per Person: ${formatCurrency(totals.perPerson)}`, 30, yPos);

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
                                              {activity.id ===
                                              "ngorongoro-crater-tour"
                                                ? "per group"
                                                : "per person"}
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Export Safari Itinerary</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Export Safari Itinerary</DialogTitle>
                  <DialogDescription>
                    Enter a name for your safari tour. This will be used as the
                    PDF file name.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Tour Name
                    </Label>
                    <Input
                      id="tour-name"
                      value={tourName}
                      onChange={(e) => setTourName(e.target.value)}
                      placeholder="Enter tour name..."
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsExportDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleExport}>Export PDF</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
