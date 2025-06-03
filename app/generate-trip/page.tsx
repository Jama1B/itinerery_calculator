"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function GenerateTripPage() {
  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-800">
          Generate Your Dream Safari
        </h1>
        <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calculator
          </Button>
        </Link>
      </div>
      <div className="bg-card p-8 rounded-lg shadow">
        <p className="text-center text-muted-foreground">
          AI Trip Generation Coming Soon!
        </p>
        {/* Placeholder for AI trip generation form/content */}
      </div>
    </div>
  );
}
