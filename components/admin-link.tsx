import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export function AdminLink() {
  return (
    <Link href="/admin" className="absolute top-4 right-4">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <span>Manage Data</span>
      </Button>
    </Link>
  );
}
