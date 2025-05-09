import SafariCalculator from "@/components/safari-calculator";
import { AdminLink } from "@/components/admin-link";

export default function Home() {
  return (
    <main className="container mx-auto max-w-6xl py-6 relative">
      <AdminLink />
      <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
        Safari Itinerary Calculator
      </h1>
      <SafariCalculator />
    </main>
  );
}
