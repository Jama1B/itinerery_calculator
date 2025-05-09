"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2 } from "lucide-react";
import type { Accommodation, RoomType } from "@/types/safaris";

interface AccommodationsManagerProps {
  accommodations: Accommodation[];
  onAccommodationsChange: () => void;
}

export function AccommodationsManager({
  accommodations,
  onAccommodationsChange,
}: AccommodationsManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentAccommodation, setCurrentAccommodation] =
    useState<Accommodation | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle accommodation deletion
  const handleDeleteAccommodation = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this accommodation? This will also delete all associated room types."
      )
    ) {
      setIsDeleting(id);
      try {
        const response = await fetch(`/api/accommodations?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete accommodation");

        toast({
          title: "Accommodation deleted",
          description: "The accommodation has been deleted successfully",
        });

        onAccommodationsChange();
      } catch (error) {
        console.error("Error deleting accommodation:", error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the accommodation",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Open edit dialog with accommodation data
  const handleEditAccommodation = (accommodation: Accommodation) => {
    setCurrentAccommodation(accommodation);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Accommodation
        </Button>
      </div>

      {accommodations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No accommodations found. Add your first accommodation to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Room Types</TableHead>
              <TableHead>In Park</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accommodations.map((accommodation) => (
              <TableRow key={accommodation.id}>
                <TableCell className="font-medium">
                  {accommodation.name}
                </TableCell>
                <TableCell>{accommodation.location || "N/A"}</TableCell>
                <TableCell>{accommodation.roomTypes.length}</TableCell>
                <TableCell>{accommodation.inPark ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditAccommodation(accommodation)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() =>
                        handleDeleteAccommodation(accommodation.id)
                      }
                      disabled={isDeleting === accommodation.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Accommodation Dialog */}
      <AddAccommodationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onAccommodationsChange}
      />

      {/* Edit Accommodation Dialog */}
      {currentAccommodation && (
        <EditAccommodationDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          accommodation={currentAccommodation}
          onSave={onAccommodationsChange}
        />
      )}
    </div>
  );
}

// Add Accommodation Dialog Component
interface AddAccommodationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

function AddAccommodationDialog({
  open,
  onOpenChange,
  onSave,
}: AddAccommodationDialogProps) {
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    description: string;
    location: string;
    includesFullBoard: boolean;
    inPark: boolean;
    roomTypes: RoomType[];
  }>({
    id: "",
    name: "",
    description: "",
    location: "",
    includesFullBoard: true,
    inPark: false,
    roomTypes: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Generate a slug from the name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Auto-generate ID from name if ID field is being edited
    if (name === "name" && !formData.id) {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        id: generateSlug(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Add a new empty room type
  const addRoomType = () => {
    const newRoomTypeId = `${formData.id}-room-${
      formData.roomTypes.length + 1
    }`;
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          id: newRoomTypeId,
          name: "",
          maxOccupancy: 1,
          highSeasonCost: 0,
          lowSeasonCost: 0,
        },
      ],
    }));
  };

  // Update room type data
  const handleRoomTypeChange = (
    index: number,
    field: keyof RoomType,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedRoomTypes = [...prev.roomTypes];
      updatedRoomTypes[index] = {
        ...updatedRoomTypes[index],
        [field]: value,
      };
      return {
        ...prev,
        roomTypes: updatedRoomTypes,
      };
    });
  };

  // Remove a room type
  const removeRoomType = (index: number) => {
    setFormData((prev) => {
      const updatedRoomTypes = [...prev.roomTypes];
      updatedRoomTypes.splice(index, 1);
      return {
        ...prev,
        roomTypes: updatedRoomTypes,
      };
    });
  };

  // Save the accommodation
  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      toast({
        title: "Missing information",
        description:
          "Please provide at least an ID and name for the accommodation",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/accommodations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save accommodation");

      toast({
        title: "Accommodation saved",
        description: "The accommodation has been saved successfully",
      });

      onSave();
      onOpenChange(false);
      // Reset form
      setFormData({
        id: "",
        name: "",
        description: "",
        location: "",
        includesFullBoard: true,
        inPark: false,
        roomTypes: [],
      });
    } catch (error) {
      console.error("Error saving accommodation:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving the accommodation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Accommodation</DialogTitle>
          <DialogDescription>
            Add a new accommodation and its room types to the safari calculator
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              placeholder="unique-accommodation-id"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Accommodation Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Description of the accommodation"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Location (e.g., Serengeti National Park)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label>Options</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includesFullBoard"
                  checked={formData.includesFullBoard}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "includesFullBoard",
                      checked as boolean
                    )
                  }
                />
                <Label htmlFor="includesFullBoard">
                  Includes Full Board (All Meals)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inPark"
                  checked={formData.inPark}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("inPark", checked as boolean)
                  }
                />
                <Label htmlFor="inPark">
                  Located Inside Park (Concession Fee Applies)
                </Label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Room Types</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRoomType}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Room Type
              </Button>
            </div>

            {formData.roomTypes.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                No room types added. Click "Add Room Type" to begin.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {formData.roomTypes.map((roomType, index) => (
                  <AccordionItem
                    key={index}
                    value={`room-${index}`}
                    className="border rounded-md"
                  >
                    <AccordionTrigger className="px-4">
                      {roomType.name || `Room Type ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`room-id-${index}`}
                          className="text-right"
                        >
                          ID
                        </Label>
                        <Input
                          id={`room-id-${index}`}
                          value={roomType.id}
                          onChange={(e) =>
                            handleRoomTypeChange(index, "id", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="unique-room-type-id"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`room-name-${index}`}
                          className="text-right"
                        >
                          Name
                        </Label>
                        <Input
                          id={`room-name-${index}`}
                          value={roomType.name}
                          onChange={(e) =>
                            handleRoomTypeChange(index, "name", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="Room Type Name (e.g., Single Room)"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`room-occupancy-${index}`}
                          className="text-right"
                        >
                          Max Occupancy
                        </Label>
                        <Input
                          id={`room-occupancy-${index}`}
                          type="number"
                          min="1"
                          value={roomType.maxOccupancy}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "maxOccupancy",
                              Number(e.target.value)
                            )
                          }
                          className="col-span-3"
                          placeholder="1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`room-high-cost-${index}`}
                            className="text-right text-sm"
                          >
                            High Season Cost
                          </Label>
                          <Input
                            id={`room-high-cost-${index}`}
                            type="number"
                            value={roomType.highSeasonCost}
                            onChange={(e) =>
                              handleRoomTypeChange(
                                index,
                                "highSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`room-low-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Low Season Cost
                          </Label>
                          <Input
                            id={`room-low-cost-${index}`}
                            type="number"
                            value={roomType.lowSeasonCost}
                            onChange={(e) =>
                              handleRoomTypeChange(
                                index,
                                "lowSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRoomType(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Room Type
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Accommodation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Accommodation Dialog Component
interface EditAccommodationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accommodation: Accommodation;
  onSave: () => void;
}

function EditAccommodationDialog({
  open,
  onOpenChange,
  accommodation,
  onSave,
}: EditAccommodationDialogProps) {
  const [formData, setFormData] = useState<Accommodation>({ ...accommodation });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Add a new empty room type
  const addRoomType = () => {
    const newRoomTypeId = `${formData.id}-room-${
      formData.roomTypes.length + 1
    }`;
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          id: newRoomTypeId,
          name: "",
          maxOccupancy: 1,
          highSeasonCost: 0,
          lowSeasonCost: 0,
        },
      ],
    }));
  };

  // Update room type data
  const handleRoomTypeChange = (
    index: number,
    field: keyof RoomType,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedRoomTypes = [...prev.roomTypes];
      updatedRoomTypes[index] = {
        ...updatedRoomTypes[index],
        [field]: value,
      };
      return {
        ...prev,
        roomTypes: updatedRoomTypes,
      };
    });
  };

  // Remove a room type
  const removeRoomType = (index: number) => {
    setFormData((prev) => {
      const updatedRoomTypes = [...prev.roomTypes];
      updatedRoomTypes.splice(index, 1);
      return {
        ...prev,
        roomTypes: updatedRoomTypes,
      };
    });
  };

  // Save the accommodation
  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      toast({
        title: "Missing information",
        description:
          "Please provide at least an ID and name for the accommodation",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/accommodations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save accommodation");

      toast({
        title: "Accommodation updated",
        description: "The accommodation has been updated successfully",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating accommodation:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the accommodation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Accommodation</DialogTitle>
          <DialogDescription>
            Update accommodation details and room types
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID
            </Label>
            <Input
              id="id"
              name="id"
              value={formData.id}
              onChange={handleChange}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Accommodation Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Description of the accommodation"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Location (e.g., Serengeti National Park)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label>Options</Label>
            </div>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includesFullBoard"
                  checked={formData.includesFullBoard}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(
                      "includesFullBoard",
                      checked as boolean
                    )
                  }
                />
                <Label htmlFor="includesFullBoard">
                  Includes Full Board (All Meals)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inPark"
                  checked={formData.inPark}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("inPark", checked as boolean)
                  }
                />
                <Label htmlFor="inPark">
                  Located Inside Park (Concession Fee Applies)
                </Label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Room Types</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRoomType}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Room Type
              </Button>
            </div>

            {formData.roomTypes.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                No room types added. Click "Add Room Type" to begin.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {formData.roomTypes.map((roomType, index) => (
                  <AccordionItem
                    key={index}
                    value={`room-${index}`}
                    className="border rounded-md"
                  >
                    <AccordionTrigger className="px-4">
                      {roomType.name || `Room Type ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`room-id-${index}`}
                          className="text-right"
                        >
                          ID
                        </Label>
                        <Input
                          id={`room-id-${index}`}
                          value={roomType.id}
                          onChange={(e) =>
                            handleRoomTypeChange(index, "id", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="unique-room-type-id"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`room-name-${index}`}
                          className="text-right"
                        >
                          Name
                        </Label>
                        <Input
                          id={`room-name-${index}`}
                          value={roomType.name}
                          onChange={(e) =>
                            handleRoomTypeChange(index, "name", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="Room Type Name (e.g., Single Room)"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`room-occupancy-${index}`}
                          className="text-right"
                        >
                          Max Occupancy
                        </Label>
                        <Input
                          id={`room-occupancy-${index}`}
                          type="number"
                          min="1"
                          value={roomType.maxOccupancy}
                          onChange={(e) =>
                            handleRoomTypeChange(
                              index,
                              "maxOccupancy",
                              Number(e.target.value)
                            )
                          }
                          className="col-span-3"
                          placeholder="1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`room-high-cost-${index}`}
                            className="text-right text-sm"
                          >
                            High Season Cost
                          </Label>
                          <Input
                            id={`room-high-cost-${index}`}
                            type="number"
                            value={roomType.highSeasonCost}
                            onChange={(e) =>
                              handleRoomTypeChange(
                                index,
                                "highSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`room-low-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Low Season Cost
                          </Label>
                          <Input
                            id={`room-low-cost-${index}`}
                            type="number"
                            value={roomType.lowSeasonCost}
                            onChange={(e) =>
                              handleRoomTypeChange(
                                index,
                                "lowSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRoomType(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Room Type
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Update Accommodation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
