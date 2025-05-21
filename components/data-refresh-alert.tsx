"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { hasDataBeenUpdatedSince } from "@/lib/update-tracker";

interface DataRefreshAlertProps {
  onRefresh: () => void;
  lastLoadTime: number;
}

export function DataRefreshAlert({
  onRefresh,
  lastLoadTime,
}: DataRefreshAlertProps) {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Check if data needs refresh when component mounts or when window gets focus
  const checkForUpdates = () => {
    if (hasDataBeenUpdatedSince(lastLoadTime)) {
      setNeedsRefresh(true);
      setIsVisible(true);
    }
  };

  useEffect(() => {
    // Check immediately when component mounts
    checkForUpdates();

    // Check when window gets focus (user returns from admin page)
    const handleFocus = () => {
      checkForUpdates();
    };

    window.addEventListener("focus", handleFocus);

    // Cleanup
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [lastLoadTime]);

  if (!isVisible) return null;

  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200">
      <AlertTitle className="flex items-center gap-2">
        <RefreshCw className="h-4 w-4" />
        Data has been updated
      </AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>
          Places or accommodations have been modified. Refresh to see the latest
          data.
        </span>
        <Button
          size="sm"
          onClick={() => {
            onRefresh();
            setIsVisible(false);
            setNeedsRefresh(false);
          }}
        >
          Refresh Data
        </Button>
      </AlertDescription>
    </Alert>
  );
}
