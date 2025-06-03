import SafariCalculator from "@/components/safari-calculator";
import { AdminLink } from "@/components/admin-link";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function Home() {
  return (
    <main className="container max-w-6xl mx-auto py-6 relative">
      <AdminLink />
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
          Safari Itinerary Calculator
        </h1>
        <Link href="/generate-trip" passHref>
          <Button variant="outline" className="mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Trip with AI
          </Button>
        </Link>
      </div>
      <SafariCalculator />
    </main>
  );
}
