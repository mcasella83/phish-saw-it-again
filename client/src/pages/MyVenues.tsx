import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { VenueStats } from "@/lib/phish-processing";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venue</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Shows</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {venues.map((venue) => {
              const venueKey = `${venue.name}-${venue.city}-${venue.state}`;
              const isExpanded = expandedVenues[venueKey] || false;

              return (
                <>
                  <TableRow
                    key={venueKey}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedVenues((prev) => ({
                        ...prev,
                        [venueKey]: !isExpanded,
                      }))
                    }
                  >
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>
                      {venue.city}, {venue.state}, {venue.country}
                    </TableCell>
                    <TableCell className="text-right">{venue.showCount}</TableCell>
                    <TableCell>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "transform rotate-180"
                        )}
                      />
                    </TableCell>
                  </TableRow>
                  {isExpanded && (
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={4} className="p-4">
                        <h4 className="text-sm font-medium mb-2">Show Dates:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {venue.dates.map((date) => (
                            <span key={date} className="text-sm">
                              {new Date(date).toLocaleDateString()}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}