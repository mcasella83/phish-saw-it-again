
import React, { useState } from "react";
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

  if (!songs || songs.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">My Songs</h2>
        <p className="text-muted-foreground">
          No song data available. Add some shows to see your song history!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My Songs ({songs.length})</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Song Name</TableHead>
              <TableHead className="w-24 text-right">Times</TableHead>
              <TableHead className="hidden md:table-cell">First Seen</TableHead>
              <TableHead className="hidden md:table-cell">Last Seen</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song) => {
              const isExpanded = expandedSongs[song.name] || false;

              return (
                <React.Fragment key={song.name}>
                  <TableRow
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      setExpandedSongs((prev) => ({
                        ...prev,
                        [song.name]: !isExpanded,
                      }))
                    }
                  >
                    <TableCell className="min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{song.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {song.playCount}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {song.occurrences[0]}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {song.occurrences[song.occurrences.length - 1]}
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
                        <h4 className="text-sm font-medium mb-2">All Dates:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {song.occurrences.map((date) => (
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
  );
}
