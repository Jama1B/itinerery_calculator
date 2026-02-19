import SafariCalculator from "@/components/safari-calculator";
import { AdminLink } from "@/components/admin-link";
import { getSafariData } from "@/lib/actions";

export default async function Home() {
  const initialData = await getSafariData();

  return (
    <main className="container max-w-6xl mx-auto py-6 relative">
      <AdminLink />
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
          Safari Itinerary Calculator
        </h1>
      </div>
      <SafariCalculator
        initialPlaces={initialData.places}
        initialAccommodations={initialData.accommodations}
        initialConstants={initialData.constants}
      />
    </main>
  );
}


