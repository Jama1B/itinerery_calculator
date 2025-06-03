"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, Wand2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  generateSafariItinerary,
  type GenerateSafariItineraryInput,
  type GenerateSafariItineraryOutput,
} from "@/src/ai/flows/generate-safari-itinerary-flow";

const travelMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function GenerateTripPage() {
  const [durationDays, setDurationDays] = useState<number>(7);
  const [numAdults, setNumAdults] = useState<number>(2);
  const [numChildren, setNumChildren] = useState<number>(0);
  const [interests, setInterests] = useState<string>("wildlife, game drives");
  const [travelMonth, setTravelMonth] = useState<string>("July");
  const [budgetLevel, setBudgetLevel] = useState<"budget" | "mid-range" | "luxury">("mid-range");
  const [additionalPreferences, setAdditionalPreferences] = useState<string>("");

  const [isLoading, setIsLoading] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<GenerateSafariItineraryOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedItinerary(null);

    const input: GenerateSafariItineraryInput = {
      durationDays,
      numAdults,
      numChildren,
      interests: interests || undefined,
      travelMonth: travelMonth as GenerateSafariItineraryInput['travelMonth'], // Cast as travelMonth is already validated by Select
      budgetLevel: budgetLevel || undefined,
      additionalPreferences: additionalPreferences || undefined,
    };

    try {
      const result = await generateSafariItinerary(input);
      setGeneratedItinerary(result);
      toast({
        title: "Safari Itinerary Generated!",
        description: "Your personalized safari plan is ready.",
      });
    } catch (err) {
      console.error("Error generating itinerary:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate itinerary: ${errorMessage}`);
      toast({
        title: "Generation Failed",
        description: `Could not generate itinerary. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800 flex items-center">
          <Wand2 className="mr-3 h-8 w-8 text-green-700" />
          Generate Your Dream Safari
        </h1>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculator
          </Button>
        </Link>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle>Tell Us About Your Trip</CardTitle>
          <CardDescription>
            Fill in your preferences and let our AI craft a personalized safari itinerary for you.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="durationDays">Duration (days)</Label>
                <Input
                  id="durationDays"
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="30"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="travelMonth">Travel Month</Label>
                <Select value={travelMonth} onValueChange={setTravelMonth} required>
                  <SelectTrigger id="travelMonth">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {travelMonths.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numAdults">Adults</Label>
                <Input
                  id="numAdults"
                  type="number"
                  value={numAdults}
                  onChange={(e) => setNumAdults(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numChildren">Children (0-15 years)</Label>
                <Input
                  id="numChildren"
                  type="number"
                  value={numChildren}
                  onChange={(e) => setNumChildren(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="budgetLevel">Budget Level</Label>
              <Select value={budgetLevel} onValueChange={(value) => setBudgetLevel(value as "budget" | "mid-range" | "luxury")} >
                <SelectTrigger id="budgetLevel">
                  <SelectValue placeholder="Select budget level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="budget">Budget</SelectItem>
                  <SelectItem value="mid-range">Mid-range</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., wildlife, photography, bird watching, cultural tours"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalPreferences">Additional Preferences</Label>
              <Textarea
                id="additionalPreferences"
                value={additionalPreferences}
                onChange={(e) => setAdditionalPreferences(e.target.value)}
                placeholder="e.g., specific animals to see, prefer lodges over tented camps, accessibility needs"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Safari...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate My Safari
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {error && (
        <Card className="border-destructive bg-destructive/10 mt-6">
          <CardHeader>
            <CardTitle className="text-destructive">Error Generating Itinerary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {generatedItinerary && (
        <Card className="shadow-xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl text-green-700">{generatedItinerary.tripTitle}</CardTitle>
            <CardDescription>
              Your personalized {generatedItinerary.itinerary.length}-day safari plan for the {generatedItinerary.suggestedSeason} season.
            </CardDescription>
             <p className="text-sm pt-2"><strong>Summary:</strong> {generatedItinerary.summary}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedItinerary.itinerary.map((dayPlan) => (
              <Card key={dayPlan.day} className="bg-stone-50/50">
                <CardHeader>
                  <CardTitle className="text-xl">Day {dayPlan.day}: {dayPlan.title}</CardTitle>
                  <CardDescription>{dayPlan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-md">Places & Activities:</h4>
                    {dayPlan.placesToVisit.map((placeDetail, index) => (
                      <div key={index} className="ml-4 mt-1 p-2 border-l-2 border-green-200">
                        <p className="font-medium">{placeDetail.placeName}</p>
                        {placeDetail.activityNames.length > 0 && (
                           <ul className="list-disc list-inside ml-4 text-sm text-gray-700">
                            {placeDetail.activityNames.map((activity, actIndex) => (
                              <li key={actIndex}>{activity}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                  {dayPlan.accommodationName && (
                    <div>
                      <h4 className="font-semibold text-md">Accommodation:</h4>
                      <p className="ml-4 text-sm text-gray-700">{dayPlan.accommodationName}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {generatedItinerary.notes && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h3 className="font-semibold text-lg text-blue-800">Additional Notes & Tips:</h3>
                <p className="text-sm text-gray-700 whitespace-pre-line">{generatedItinerary.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
