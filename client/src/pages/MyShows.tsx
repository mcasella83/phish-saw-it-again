import React, { useState, useMemo, useRef } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhishShowSetlist, PhishSong } from "@/lib/types";
import { SongTag } from "@/components/SongTag";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

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

  const rgb = [h + 1 / 3, h, h - 1 / 3].map((t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  });

  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
};

export default function MyShows({
  showsWithSetLists,
  loading,
  loadingShowCount,
  loadingMaxShowCount,
}: MyShowsProps) {
  const [expandedShows, setExpandedShows] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isHistogramCollapsed, setIsHistogramCollapsed] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const showsByYear = useMemo(() => {
    if (!showsWithSetLists?.length) return [];

    const counts: Record<number, number> = {};
    showsWithSetLists.forEach((show) => {
      const year = new Date(show.date).getFullYear();
      counts[year] = (counts[year] || 0) + 1;
    });

    const totalShows = showsWithSetLists.length;

    return Object.entries(counts)
      .map(([year, count]) => ({
        year: parseInt(year),
        count,
        percentage: (count / totalShows) * 100,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      }))
      .sort((a, b) => a.year - b.year);
  }, [showsWithSetLists]);

  const scrollToYear = (year: number) => {
    if (!tableRef.current) return;

    const yearRow = tableRef.current.querySelector(`[data-year="${year}"]`);

    if (yearRow) {
      const headerHeight = 64; // Fixed header height
      const histogramHeight = isHistogramCollapsed ? 120 : 480; // Histogram section height
      const padding = 16; // Padding for better visibility

      const elementPosition =
        yearRow.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition =
        elementPosition - (headerHeight + histogramHeight + padding);

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
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
      <div className="fixed top-16 left-0 right-0 z-50 bg-background px-8">
        <h2 className="text-xl font-semibold mb-4">
          My Shows ({showsWithSetLists.length})
        </h2>
        <div className="rounded-md border shadow-sm w-full">
          <div className="flex justify-between items-center p-4">
            <h3 className="text-lg font-medium">Shows by Year</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHistogramCollapsed(!isHistogramCollapsed)}
              className="flex items-center gap-2"
            >
              {isHistogramCollapsed ? (
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
              isHistogramCollapsed ? "h-0 overflow-hidden" : "h-[340px] p-4",
            )}
          >
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={showsByYear}
                  margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
                  onMouseMove={(state) => {
                    if (
                      state &&
                      state.activePayload &&
                      state.activePayload[0]
                    ) {
                      const year = (state.activePayload[0].payload as YearData)
                        .year;
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
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [value, "Shows"]}
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
                        stroke={
                          selectedYear === entry.year ? "#000000" : entry.color
                        }
                        strokeWidth={selectedYear === entry.year ? 2 : 0}
                        strokeOpacity={1}
                        style={{
                          filter:
                            selectedYear === entry.year
                              ? "brightness(1.1)"
                              : "none",
                        }}
                      />
                    ))}
                    <LabelList
                      dataKey="count"
                      position="center"
                      content={({ x, y, width, height, value, index }) => {
                        const entry = showsByYear[index];
                        if (!entry) return null;

                        const luminance = getLuminance(entry.color);
                        const textColor =
                          luminance > 0.5 ? "#000000" : "#FFFFFF";
                        const xPos =
                          (Number(x) || 0) + (Number(width) || 0) / 2;
                        const yPos =
                          (Number(y) || 0) + (Number(height) || 0) / 2;
                        const isSingleShow = value === 1;

                        return (
                          <g>
                            {isSingleShow ? (
                              <text
                                x={xPos}
                                y={yPos}
                                fill={textColor}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="text-xs"
                              >
                                {value} ({entry.percentage.toFixed(1)}%)
                              </text>
                            ) : (
                              <>
                                <text
                                  x={xPos}
                                  y={yPos - 8}
                                  fill={textColor}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  className="font-bold text-sm"
                                >
                                  {value}
                                </text>
                                <text
                                  x={xPos}
                                  y={yPos + 8}
                                  fill={textColor}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  className="text-xs"
                                >
                                  {entry.percentage.toFixed(1)}%
                                </text>
                              </>
                            )}
                          </g>
                        );
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "transition-all duration-300",
          isHistogramCollapsed ? "pt-[120px]" : "pt-[480px]",
        )}
      >
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
                  {},
                );

                return (
                  <React.Fragment key={showId}>
                    <TableRow
                      data-year={showYear}
                      className={cn(
                        "cursor-pointer hover:bg-muted/50",
                        selectedYear === showYear && "bg-muted",
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
                            isExpanded && "transform rotate-180",
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(songsBySet).map(
                                ([setName, songs]) => (
                                  <div
                                    key={`${showId}-${setName}`}
                                    className="space-y-2 bg-muted/30 p-4 rounded-lg"
                                  >
                                    <h4 className="font-medium text-sm border-b pb-2">
                                      {setName === "e"
                                        ? "Encore"
                                        : `Set ${setName}`}
                                    </h4>
                                    <ol className="list-decimal list-inside text-sm space-y-1">
                                      {songs.map((song) => (
                                        <li
                                          key={song.uniqueid}
                                          className="text-sm"
                                        >
                                          {song.name}
                                          {song.transition === 2 && " >"}
                                          {song.transition === 3 && " ->"}
                                          {/*song.isjam && " [jam]"*/}
                                          {song.isBustout && (
                                            <SongTag
                                              type="bustout"
                                              className="ml-2"
                                            />
                                          )}
                                          {song.isFirstTimeHeard &&
                                            !song.isLastTimeHeard && (
                                              <SongTag
                                                type="firstTime"
                                                className="ml-2"
                                              />
                                            )}
                                          {song.isLastTimeHeard &&
                                            !song.isFirstTimeHeard && (
                                              <SongTag
                                                type="lastTime"
                                                className="ml-2"
                                              />
                                            )}
                                          {song.isLastTimeHeard &&
                                            song.isFirstTimeHeard && (
                                              <SongTag
                                                type="only"
                                                className="ml-2"
                                              />
                                            )}
                                          {/* {song.isFirstTimeHeardOpener && (
                                            <SongTag
                                              type="firstOpener"
                                              className="ml-2"
                                            />
                                          )}
                                          {song.isFirstTimeHeardCloser && (
                                            <SongTag
                                              type="firstCloser"
                                              className="ml-2"
                                            />
                                          )} */}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                ),
                              )}
                            </div>
                            {show.setListNotes && (
                              <div className="mt-6 border-t pt-4">
                                <h4 className="font-medium text-sm">Notes:</h4>
                                <div
                                  className="text-sm text-muted-foreground whitespace-pre-wrap mt-2"
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
    </div>
  );
}
