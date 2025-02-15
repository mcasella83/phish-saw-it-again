import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { VenueStats } from "@/lib/phish-processing";

interface MyVenuesProps {
  venues: VenueStats[] | null;
}

export default function MyVenues({ venues }: MyVenuesProps) {
  const [expandedVenues, setExpandedVenues] = useState<Record<string, boolean>>({});

  if (!venues || venues.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Venues</h2>
        <p className="text-muted-foreground">
          No venue data available. Add some shows to see your concert venues!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Venues ({venues.length})</h2>
      <div className="grid gap-4">
        {venues.map((venue) => {
          const venueKey = `${venue.name}-${venue.city}-${venue.state}`;
          const isExpanded = expandedVenues[venueKey] || false;

          return (
            <Collapsible
              key={venueKey}
              open={isExpanded}
              onOpenChange={(open) =>
                setExpandedVenues((prev) => ({ ...prev, [venueKey]: open }))
              }
              className="border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <CollapsibleTrigger className="w-full">
                <div className="p-4 flex items-start justify-between cursor-pointer">
                  <div>
                    <h3 className="font-medium">{venue.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {venue.city}, {venue.state}, {venue.country}
                    </p>
                    <p className="text-sm">
                      {venue.showCount} {venue.showCount === 1 ? "show" : "shows"}
                    </p>
                  </div>
                  <div className="p-2">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "transform rotate-180"
                      )}
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4">
                  <h4 className="text-sm font-medium mb-2">Show Dates:</h4>
                  <ul className="text-sm space-y-1">
                    {venue.dates.map((date) => (
                      <li key={date}>
                        {new Date(date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}