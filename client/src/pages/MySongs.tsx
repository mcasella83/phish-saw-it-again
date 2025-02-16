import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SongStats } from "@/lib/phish-processing";

interface MySongsProps {
  songs: SongStats[] | null;
}

export default function MySongs({ songs }: MySongsProps) {
  const [expandedSongs, setExpandedSongs] = useState<Record<string, boolean>>({});

  if (!songs) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Songs</h2>
        <p className="text-muted-foreground">
          Enter your username to see your song statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        My Songs ({songs.length} unique songs)
      </h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Song Name</TableHead>
              <TableHead className="w-24 text-right">Times Seen</TableHead>
              <TableHead>First Seen</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song) => {
              const isExpanded = expandedSongs[song.name] || false;
              return (
                <>
                  <TableRow
                    key={song.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedSongs((prev) => ({
                        ...prev,
                        [song.name]: !isExpanded,
                      }))
                    }
                  >
                    <TableCell>{song.name}</TableCell>
                    <TableCell className="text-right">{song.playCount}</TableCell>
                    <TableCell>
                      {new Date(song.dates[0]).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        song.dates[song.dates.length - 1],
                      ).toLocaleDateString()}
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
                      <TableCell colSpan={5} className="p-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Performance Dates:</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {song.dates.map((date, index) => (
                              <div
                                key={date}
                                className="text-sm p-2 bg-muted/30 rounded"
                              >
                                {new Date(date).toLocaleDateString()}
                              </div>
                            ))}
                          </div>
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