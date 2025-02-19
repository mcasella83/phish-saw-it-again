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
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { VenueStats } from "@/lib/phish-processing";

interface MyVenuesProps {
  venues: VenueStats[] | null;
}

export default function MyVenues({ venues }: MyVenuesProps) {
  const [expandedVenues, setExpandedVenues] = useState<Record<string, boolean>>(
    {},
  );
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

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
    index,
    payload,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Calculate percentage and only show label if > 5%
    const percent =
      (value / venues.reduce((acc, v) => acc + v.showCount, 0)) * 100;
    if (percent <= 5) return null;

    const textAnchor = "middle";
    const shortenedName = payload.name.length > 12 
      ? payload.name.substring(0, 10) + '...'
      : payload.name;

    return (
      <g>
        <text
          x={x}
          y={y - 6}
          fill="white"
          textAnchor={textAnchor}
          dominantBaseline="central"
          className="text-[10px] font-medium"
        >
          {shortenedName}
        </text>
        <text
          x={x}
          y={y + 6}
          fill="white"
          textAnchor={textAnchor}
          dominantBaseline="central"
          className="text-[9px]"
        >
          {`${value} (${percent.toFixed(0)}%)`}
        </text>
      </g>
    );
  };

  return (
    <div className="space-y-4">
      <div className="fixed top-16 left-0 right-0 z-50 bg-background px-8">
        <h2 className="text-xl font-semibold mb-4">
          My Venues ({venues.length})
        </h2>
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
                      `${value} shows (${(((value as number) / totalShows) * 100).toFixed(1)}%)`,
                      name,
                    ]}
                  />
                  <Pie
                    data={venueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    label={renderCustomizedLabel}
                    labelLine={false}
                    stroke="none"
                    style={{ outline: "none" }}
                    onMouseEnter={(data) => {
                      setSelectedVenue(data.name);
                    }}
                    onMouseLeave={() => {
                      setSelectedVenue(null);
                    }}
                    isAnimationActive={false}
                  >
                    {venueData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
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
                      <TableCell className="font-medium">
                        {venue.name}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {venue.city}, {venue.state}, {venue.country}
                      </TableCell>
                      <TableCell className="text-right">
                        {venue.showCount}
                      </TableCell>
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
                          <h4 className="text-sm font-medium mb-2">
                            Show Dates:
                          </h4>
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