import SafariCalculator from "@/components/safari-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f9f5ed] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">Safari Itinerary Calculator</h1>
        <p className="text-gray-600 mb-8">Plan your perfect safari adventure and calculate costs per client</p>
        <SafariCalculator />
      </div>
    </main>
  )
}

