"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Place, Activity } from "@/types/safaris";
import { setLastUpdateTimestamp } from "@/lib/update-tracker";

interface PlacesManagerProps {
  places: Place[];
  onPlacesChange: () => void;
}

export function PlacesManager({ places, onPlacesChange }: PlacesManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  // Handle place deletion
  const handleDeletePlace = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this place? This will also delete all associated activities."
      )
    ) {
      setIsDeleting(id);
      try {
        const response = await fetch(`/api/places?id=${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete place");

        toast({
          title: "Place deleted",
          description: "The place has been deleted successfully",
        });

        setLastUpdateTimestamp();
        onPlacesChange();
      } catch (error) {
        console.error("Error deleting place:", error);
        toast({
          title: "Delete failed",
          description: "There was an error deleting the place",
          variant: "destructive",
        });
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Open edit dialog with place data
  const handleEditPlace = (place: Place) => {
    setCurrentPlace(place);
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New Place
        </Button>
      </div>

      {places.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No places found. Add your first place to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Activities</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {places.map((place) => (
              <TableRow key={place.id}>
                <TableCell className="font-medium">{place.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {place.description}
                </TableCell>
                <TableCell>{place.activities.length}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPlace(place)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => handleDeletePlace(place.id)}
                      disabled={isDeleting === place.id}
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

      {/* Add Place Dialog */}
      <AddPlaceDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSave={onPlacesChange}
      />

      {/* Edit Place Dialog */}
      {currentPlace && (
        <EditPlaceDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          place={currentPlace}
          onSave={onPlacesChange}
        />
      )}
    </div>
  );
}

// Add Place Dialog Component
interface AddPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

function AddPlaceDialog({ open, onOpenChange, onSave }: AddPlaceDialogProps) {
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    description: string;
    activities: Activity[];
  }>({
    id: "",
    name: "",
    description: "",
    activities: [],
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

  // Add a new empty activity
  const addActivity = () => {
    const newActivityId = `${formData.id}-activity-${
      formData.activities.length + 1
    }`;
    setFormData((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          id: newActivityId,
          name: "",
          description: "",
          highSeasonCost: 0,
          lowSeasonCost: 0,
          childHighSeasonCost: 0,
          childLowSeasonCost: 0,
        },
      ],
    }));
  };

  // Update activity data
  const handleActivityChange = (
    index: number,
    field: keyof Activity,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedActivities = [...prev.activities];
      updatedActivities[index] = {
        ...updatedActivities[index],
        [field]: value,
      };
      return {
        ...prev,
        activities: updatedActivities,
      };
    });
  };

  // Remove an activity
  const removeActivity = (index: number) => {
    setFormData((prev) => {
      const updatedActivities = [...prev.activities];
      updatedActivities.splice(index, 1);
      return {
        ...prev,
        activities: updatedActivities,
      };
    });
  };

  // Save the place
  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      toast({
        title: "Missing information",
        description: "Please provide at least an ID and name for the place",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save place");

      toast({
        title: "Place saved",
        description: "The place has been saved successfully",
      });

      setLastUpdateTimestamp();
      onSave();
      onOpenChange(false);
      // Reset form
      setFormData({
        id: "",
        name: "",
        description: "",
        activities: [],
      });
    } catch (error) {
      console.error("Error saving place:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving the place",
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
          <DialogTitle>Add New Place</DialogTitle>
          <DialogDescription>
            Add a new place and its activities to the safari calculator
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
              placeholder="unique-place-id"
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
              placeholder="Place Name"
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
              placeholder="Description of the place"
            />
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Activities</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addActivity}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Activity
              </Button>
            </div>

            {formData.activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                No activities added. Click "Add Activity" to begin.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {formData.activities.map((activity, index) => (
                  <AccordionItem
                    key={index}
                    value={`activity-${index}`}
                    className="border rounded-md"
                  >
                    <AccordionTrigger className="px-4">
                      {activity.name || `Activity ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`activity-id-${index}`}
                          className="text-right"
                        >
                          ID
                        </Label>
                        <Input
                          id={`activity-id-${index}`}
                          value={activity.id}
                          onChange={(e) =>
                            handleActivityChange(index, "id", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="unique-activity-id"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`activity-name-${index}`}
                          className="text-right"
                        >
                          Name
                        </Label>
                        <Input
                          id={`activity-name-${index}`}
                          value={activity.name}
                          onChange={(e) =>
                            handleActivityChange(index, "name", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="Activity Name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`activity-desc-${index}`}
                          className="text-right"
                        >
                          Description
                        </Label>
                        <Textarea
                          id={`activity-desc-${index}`}
                          value={activity.description}
                          onChange={(e) =>
                            handleActivityChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="col-span-3"
                          placeholder="Description of the activity"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`activity-high-cost-${index}`}
                            className="text-right text-sm"
                          >
                            High Season Cost
                          </Label>
                          <Input
                            id={`activity-high-cost-${index}`}
                            type="number"
                            value={activity.highSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
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
                            htmlFor={`activity-low-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Low Season Cost
                          </Label>
                          <Input
                            id={`activity-low-cost-${index}`}
                            type="number"
                            value={activity.lowSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "lowSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`activity-child-high-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Child High Season
                          </Label>
                          <Input
                            id={`activity-child-high-cost-${index}`}
                            type="number"
                            value={activity.childHighSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "childHighSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`activity-child-low-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Child Low Season
                          </Label>
                          <Input
                            id={`activity-child-low-cost-${index}`}
                            type="number"
                            value={activity.childLowSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "childLowSeasonCost",
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
                          onClick={() => removeActivity(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Activity
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
            {isSaving ? "Saving..." : "Save Place"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Edit Place Dialog Component
interface EditPlaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: Place;
  onSave: () => void;
}

function EditPlaceDialog({
  open,
  onOpenChange,
  place,
  onSave,
}: EditPlaceDialogProps) {
  const [formData, setFormData] = useState<Place>({ ...place });
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

  // Add a new empty activity
  const addActivity = () => {
    const newActivityId = `${formData.id}-activity-${
      formData.activities.length + 1
    }`;
    setFormData((prev) => ({
      ...prev,
      activities: [
        ...prev.activities,
        {
          id: newActivityId,
          name: "",
          description: "",
          highSeasonCost: 0,
          lowSeasonCost: 0,
          childHighSeasonCost: 0,
          childLowSeasonCost: 0,
        },
      ],
    }));
  };

  // Update activity data
  const handleActivityChange = (
    index: number,
    field: keyof Activity,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedActivities = [...prev.activities];
      updatedActivities[index] = {
        ...updatedActivities[index],
        [field]: value,
      };
      return {
        ...prev,
        activities: updatedActivities,
      };
    });
  };

  // Remove an activity
  const removeActivity = (index: number) => {
    setFormData((prev) => {
      const updatedActivities = [...prev.activities];
      updatedActivities.splice(index, 1);
      return {
        ...prev,
        activities: updatedActivities,
      };
    });
  };

  // Save the place
  const handleSave = async () => {
    if (!formData.id || !formData.name) {
      toast({
        title: "Missing information",
        description: "Please provide at least an ID and name for the place",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save place");

      toast({
        title: "Place updated",
        description: "The place has been updated successfully",
      });

      setLastUpdateTimestamp();
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating place:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the place",
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
          <DialogTitle>Edit Place</DialogTitle>
          <DialogDescription>
            Update place details and activities
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
              placeholder="Place Name"
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
              placeholder="Description of the place"
            />
          </div>

          <div className="border-t pt-4 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Activities</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addActivity}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Activity
              </Button>
            </div>

            {formData.activities.length === 0 ? (
              <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                No activities added. Click "Add Activity" to begin.
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-4">
                {formData.activities.map((activity, index) => (
                  <AccordionItem
                    key={index}
                    value={`activity-${index}`}
                    className="border rounded-md"
                  >
                    <AccordionTrigger className="px-4">
                      {activity.name || `Activity ${index + 1}`}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 space-y-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`activity-id-${index}`}
                          className="text-right"
                        >
                          ID
                        </Label>
                        <Input
                          id={`activity-id-${index}`}
                          value={activity.id}
                          onChange={(e) =>
                            handleActivityChange(index, "id", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="unique-activity-id"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`activity-name-${index}`}
                          className="text-right"
                        >
                          Name
                        </Label>
                        <Input
                          id={`activity-name-${index}`}
                          value={activity.name}
                          onChange={(e) =>
                            handleActivityChange(index, "name", e.target.value)
                          }
                          className="col-span-3"
                          placeholder="Activity Name"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label
                          htmlFor={`activity-desc-${index}`}
                          className="text-right"
                        >
                          Description
                        </Label>
                        <Textarea
                          id={`activity-desc-${index}`}
                          value={activity.description}
                          onChange={(e) =>
                            handleActivityChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="col-span-3"
                          placeholder="Description of the activity"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`activity-high-cost-${index}`}
                            className="text-right text-sm"
                          >
                            High Season Cost
                          </Label>
                          <Input
                            id={`activity-high-cost-${index}`}
                            type="number"
                            value={activity.highSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
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
                            htmlFor={`activity-low-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Low Season Cost
                          </Label>
                          <Input
                            id={`activity-low-cost-${index}`}
                            type="number"
                            value={activity.lowSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "lowSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`activity-child-high-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Child High Season
                          </Label>
                          <Input
                            id={`activity-child-high-cost-${index}`}
                            type="number"
                            value={activity.childHighSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "childHighSeasonCost",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                          />
                        </div>
                        <div className="grid grid-cols-2 items-center gap-2">
                          <Label
                            htmlFor={`activity-child-low-cost-${index}`}
                            className="text-right text-sm"
                          >
                            Child Low Season
                          </Label>
                          <Input
                            id={`activity-child-low-cost-${index}`}
                            type="number"
                            value={activity.childLowSeasonCost}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "childLowSeasonCost",
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
                          onClick={() => removeActivity(index)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Activity
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
            {isSaving ? "Saving..." : "Update Place"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
