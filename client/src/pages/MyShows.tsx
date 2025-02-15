import { useState } from "react";
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
  );
}