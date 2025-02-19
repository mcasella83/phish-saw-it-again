import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Tooltip,
  LabelList,
} from "recharts";
import { VenueStats } from "@/lib/phish-processing";

interface MyVenuesProps {
  venues: VenueStats[] | null;
}

export default function MyVenues({ venues }: MyVenuesProps) {
  const [expandedVenues, setExpandedVenues] = useState<Record<string, boolean>>({});
  const [isChartCollapsed, setIsChartCollapsed] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);

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

  const totalShows = venues.reduce((acc, venue) => acc + venue.showCount, 0);

  const venueData = useMemo(() => {
    return venues.map((venue, index) => ({
      name: venue.name,
      value: venue.showCount,
      percentage: (venue.showCount / totalShows) * 100,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
    }));
  }, [venues, totalShows]);

  return (
    <div className="space-y-4">
      <div className="fixed top-16 left-0 right-0 z-50 bg-background px-8">
        <h2 className="text-xl font-semibold mb-4">My Venues ({venues.length})</h2>
        <div className="rounded-md border shadow-sm w-full">
          <div className="flex justify-between items-center p-4">
            <h3 className="text-lg font-medium">Venue Distribution</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsChartCollapsed(!isChartCollapsed)}
              className="flex items-center gap-2"
            >
              {isChartCollapsed ? (
                <>
                  Show <ChevronDown className="h-4 w-4" />
                </>
              ) : (
                <>
                  Hide <ChevronUp className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
          <div
            className={cn(
              "transition-all duration-300 border-t",
              isChartCollapsed ? "h-0 overflow-hidden" : "h-[340px] p-4",
            )}
          >
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} shows (${((value as number) / totalShows * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                  <Pie
                    data={venueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    onMouseEnter={(data) => {
                      setSelectedVenue(data.name);
                    }}
                    onMouseLeave={() => {
                      setSelectedVenue(null);
                    }}
                  >
                    {venueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      >
                        {entry.percentage >= 5 && (
                          <Label
                            content={({ viewBox }) => {
                              const { cx, cy } = viewBox;
                              return (
                                <g>
                                  <text
                                    x={cx}
                                    y={cy - 12}
                                    fill="#FFFFFF"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-bold text-xl"
                                  >
                                    {entry.name}
                                  </text>
                                  <text
                                    x={cx}
                                    y={cy + 8}
                                    fill="#FFFFFF"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-bold text-sm"
                                  >
                                    {entry.value} shows
                                  </text>
                                  <text
                                    x={cx}
                                    y={cy + 24}
                                    fill="#FFFFFF"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-bold text-sm"
                                  >
                                    {entry.percentage.toFixed(1)}%
                                  </text>
                                </g>
                              );
                            }}
                          />
                        )}
                      </Cell>
                    ))}
                    <LabelList
                      dataKey="name"
                      position="outside"
                      content={({ x, y, value, index }) => {
                        const entry = venueData[index];
                        if (!entry || entry.percentage >= 5) return null;
                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#000000"
                            textAnchor={Number(x) > 250 ? "start" : "end"}
                            className="text-xs font-bold"
                          >
                            {`${value} (${entry.value}, ${entry.percentage.toFixed(1)}%)`}
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-300",
          isChartCollapsed ? "pt-[120px]" : "pt-[480px]",
        )}
      >
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Venue</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="text-right">Shows</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => {
                const venueKey = `${venue.name}-${venue.city}-${venue.state}`;
                const isExpanded = expandedVenues[venueKey] || false;

                return (
                  <React.Fragment key={venueKey}>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        setExpandedVenues((prev) => ({
                          ...prev,
                          [venueKey]: !isExpanded,
                        }))
                      }
                    >
                      <TableCell className="font-medium">{venue.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {venue.city}, {venue.state}, {venue.country}
                      </TableCell>
                      <TableCell className="text-right">{venue.showCount}</TableCell>
                      <TableCell>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isExpanded && "transform rotate-180",
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
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}