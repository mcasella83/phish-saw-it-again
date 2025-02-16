import React, { useState, useMemo } from "react";
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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

  // Calculate show counts per year
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
        count
      }))
      .sort((a, b) => a.year - b.year);
  }, [showsWithSetLists]);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="rounded-md border">
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
                        className="cursor-pointer hover:bg-muted/50"
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
        <div className="lg:col-span-1 rounded-md border p-4">
          <h3 className="text-lg font-medium mb-4">Shows by Year</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={showsByYear} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
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
                />
                <Bar 
                  dataKey="count" 
                  fill="var(--primary)" 
                  name="Shows"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}