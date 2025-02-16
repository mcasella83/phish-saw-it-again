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
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";

interface MyShowsProps {
  showsWithSetLists: PhishShowSetlist[];
  loading: boolean;
  loadingShowCount: number;
  loadingMaxShowCount: number;
}

interface YearData {
  year: number;
  count: number;
  percentage: number;
  color: string;
}

const getLuminance = (color: string): number => {
  const hsl = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hsl) return 0.5;

  const h = parseInt(hsl[1]) / 360;
  const s = parseInt(hsl[2]) / 100;
  const l = parseInt(hsl[3]) / 100;

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const rgb = [
    h + 1/3,
    h,
    h - 1/3
  ].map(t => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  });

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};

export default function MyShows({
  showsWithSetLists,
  loading,
  loadingShowCount,
  loadingMaxShowCount
}: MyShowsProps) {
  const [expandedShows, setExpandedShows] = useState<Record<string, boolean>>({});
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const showsByYear = useMemo(() => {
    if (!showsWithSetLists?.length) return [];

    const counts: Record<number, number> = {};
    showsWithSetLists.forEach(show => {
      const year = new Date(show.date).getFullYear();
      counts[year] = (counts[year] || 0) + 1;
    });

    const totalShows = showsWithSetLists.length;

    return Object.entries(counts)
      .map(([year, count]) => ({
        year: parseInt(year),
        count,
        percentage: (count / totalShows) * 100,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      }))
      .sort((a, b) => a.year - b.year);
  }, [showsWithSetLists]);

  const scrollToYear = (year: number) => {
    if (!tableRef.current) return;

    const yearRow = tableRef.current.querySelector(
      `[data-year="${year}"]`
    );

    if (yearRow) {
      const histogramOffset = 400; 
      const elementPosition = yearRow.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - histogramOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
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
      <div className="sticky top-4 z-10 bg-background rounded-md border p-4 mb-4 shadow-sm -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12">
        <h3 className="text-lg font-medium mb-4">Shows by Year</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={showsByYear}
              margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
              onMouseMove={(state) => {
                if (state && state.activePayload && state.activePayload[0]) {
                  const year = (state.activePayload[0].payload as YearData).year;
                  setSelectedYear(year);
                }
              }}
              onMouseLeave={() => {
                setSelectedYear(null);
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
                cursor={false}
              />
              <Bar
                dataKey="count"
                name="Shows"
                onClick={(data) => {
                  const yearData = data as unknown as YearData;
                  setSelectedYear(yearData.year);
                  scrollToYear(yearData.year);
                }}
                cursor="pointer"
              >
                {showsByYear.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={selectedYear === entry.year ? '#000000' : entry.color}
                    strokeWidth={selectedYear === entry.year ? 2 : 0}
                    strokeOpacity={1}
                    style={{
                      filter: selectedYear === entry.year ? 'brightness(1.1)' : 'none',
                    }}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="center"
                  content={({ x, y, width, height, value, index }) => {
                    const entry = showsByYear[index];
                    const luminance = getLuminance(entry.color);
                    const textColor = luminance > 0.5 ? '#000000' : '#FFFFFF';

                    return (
                      <g>
                        <text
                          x={(x || 0) + (width || 0) / 2}
                          y={(y || 0) + (height || 0) / 2 - 8}
                          fill={textColor}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="font-bold text-sm"
                        >
                          {value}
                        </text>
                        <text
                          x={(x || 0) + (width || 0) / 2}
                          y={(y || 0) + (height || 0) / 2 + 8}
                          fill={textColor}
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="text-xs"
                        >
                          {entry.percentage.toFixed(1)}%
                        </text>
                      </g>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
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