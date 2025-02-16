import React, { useState, useMemo, useRef } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhishShowSetlist, PhishSong } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface MyShowsProps {
  showsWithSetLists: PhishShowSetlist[];
  loading: boolean;
  loadingShowCount: number;
  loadingMaxShowCount: number;
}

export default function MyShows({ 
  showsWithSetLists, 
  loading, 
  loadingShowCount, 
  loadingMaxShowCount 
}: MyShowsProps) {
  const [expandedShows, setExpandedShows] = useState<Record<string, boolean>>({});
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Calculate show counts per year and assign random colors
  const showsByYear = useMemo(() => {
    if (!showsWithSetLists?.length) return [];

    const counts: Record<number, number> = {};
    showsWithSetLists.forEach(show => {
      const year = new Date(show.date).getFullYear();
      counts[year] = (counts[year] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([year, count]) => ({
        year: parseInt(year),
        count,
        // Generate a random but visually pleasing color using HSL
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }))
      .sort((a, b) => a.year - b.year);
  }, [showsWithSetLists]);

  const scrollToYear = (year: number) => {
    if (!tableRef.current) return;

    // Find the first show of the selected year
    const firstShowOfYear = showsWithSetLists.find(
      show => new Date(show.date).getFullYear() === year
    );

    if (firstShowOfYear) {
      const yearRow = tableRef.current.querySelector(
        `[data-year="${year}"]`
      );

      if (yearRow) {
        // Add offset to account for the sticky histogram
        const histogramHeight = 400; // Height of histogram + padding
        const scrollOptions = {
          behavior: 'smooth' as const,
          block: 'start' as const,
        };

        yearRow.scrollIntoView(scrollOptions);

        // Additional offset to account for the sticky histogram
        window.scrollBy({
          top: -histogramHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">
          Loading shows... ({loadingShowCount} out of {loadingMaxShowCount})
        </p>
      </div>
    );
  }

  if (!showsWithSetLists || showsWithSetLists.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Shows</h2>
        <p className="text-muted-foreground">
          No show data available. Add some shows to see your concert history!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Shows ({showsWithSetLists.length})</h2>
      {/* Chart section - sticky at the top */}
      <div className="sticky top-4 z-10 bg-background rounded-md border p-4 mb-4 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Shows by Year</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={showsByYear} 
              margin={{ top: 20, right: 0, left: -20, bottom: 5 }}
              onClick={(data) => {
                if (data && data.activePayload && data.activePayload[0]) {
                  const year = data.activePayload[0].payload.year;
                  setSelectedYear(year);
                  scrollToYear(year);
                }
              }}
            >
              <XAxis 
                dataKey="year" 
                tickFormatter={(value) => value.toString()}
                fontSize={12}
              />
              <YAxis 
                allowDecimals={false}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value, name) => [value, 'Shows']}
                labelFormatter={(label) => `Year: ${label}`}
                cursor={{ 
                  fill: 'transparent',
                  stroke: 'var(--foreground)',
                  strokeWidth: 1
                }}
              />
              <Bar 
                dataKey="count" 
                name="Shows"
                onClick={(data) => {
                  setSelectedYear(data.year);
                  scrollToYear(data.year);
                }}
                cursor="pointer"
              >
                {showsByYear.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Shows table */}
      <div className="rounded-md border" ref={tableRef}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showsWithSetLists.map((show) => {
              const showId = show.id.toString();
              const showYear = new Date(show.date).getFullYear();
              const isExpanded = expandedShows[showId] || false;
              const songsBySet = show.songs.reduce(
                (acc: Record<string, PhishSong[]>, song) => {
                  const setKey = song.set;
                  if (!acc[setKey]) {
                    acc[setKey] = [];
                  }
                  acc[setKey].push(song);
                  return acc;
                },
                {}
              );

              return (
                <React.Fragment key={showId}>
                  <TableRow
                    data-year={showYear}
                    className={cn(
                      "cursor-pointer hover:bg-muted/50",
                      selectedYear === showYear && "bg-muted"
                    )}
                    onClick={() =>
                      setExpandedShows((prev) => ({
                        ...prev,
                        [showId]: !isExpanded,
                      }))
                    }
                  >
                    <TableCell>
                      {new Date(show.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {show.venue}
                    </TableCell>
                    <TableCell>
                      {show.city}, {show.state}, {show.country}
                    </TableCell>
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
                        <div className="space-y-4">
                          {/* Sets */}
                          {Object.entries(songsBySet).map(([setName, songs]) => (
                            <div key={`${showId}-${setName}`} className="space-y-2">
                              <h4 className="font-medium text-sm">
                                {setName === "e" ? "Encore" : `Set ${setName}`}
                              </h4>
                              <ol className="list-decimal list-inside text-sm space-y-1">
                                {songs.map((song) => (
                                  <li key={song.uniqueid} className="text-sm">
                                    {song.name}
                                    {song.transition === 2 && " >"}
                                    {song.transition === 3 && " ->"}
                                    {song.isjam && " [jam]"}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          ))}
                          {/* Notes */}
                          {show.setListNotes && (
                            <div className="mt-4">
                              <h4 className="font-medium text-sm">Notes:</h4>
                              <div
                                className="text-sm text-muted-foreground whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{
                                  __html: show.setListNotes,
                                }}
                              />
                            </div>
                          )}
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
  );
}