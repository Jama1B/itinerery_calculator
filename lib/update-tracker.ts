// Helper functions to track data updates

// Store the last update timestamp in localStorage
export function setLastUpdateTimestamp() {
  if (typeof window !== "undefined") {
    const timestamp = new Date().getTime();
    localStorage.setItem("safari-data-last-updated", timestamp.toString());
    // Also set the refresh needed flag
    localStorage.setItem("safari-data-refresh-needed", "true");
    return timestamp;
  }
  return null;
}

// Get the last update timestamp from localStorage
export function getLastUpdateTimestamp(): number | null {
  if (typeof window !== "undefined") {
    const timestamp = localStorage.getItem("safari-data-last-updated");
    return timestamp ? Number.parseInt(timestamp, 10) : null;
  }
  return null;
}

// Check if data has been updated since the given timestamp
export function hasDataBeenUpdatedSince(timestamp: number): boolean {
  const lastUpdate = getLastUpdateTimestamp();
  return lastUpdate !== null && lastUpdate > timestamp;
}
