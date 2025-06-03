"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { setLastUpdateTimestamp } from "@/lib/update-tracker";

export function AdminHeader() {
  // Set the update timestamp when returning to calculator
  const handleReturn = () => {
    setLastUpdateTimestamp();
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="flex-grow text-center text-2xl font-bold text-green-800">
        Safari Data Management
      </h1>
      <div className="flex gap-2">
        <Link href="/?refresh=true" onClick={handleReturn}>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Calculator</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
