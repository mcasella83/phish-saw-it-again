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
import { SongTag } from "@/components/SongTag";

interface MySongsProps {
  songs: SongStats[] | null;
}

export default function MySongs({ songs }: MySongsProps) {
  const [expandedSongs, setExpandedSongs] = useState<Record<string, boolean>>(
    {},
  );

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
              <TableHead className="min-w-[300px]">Song Name</TableHead>
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
                  <TableCell className="min-w-[300px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{song.name}</span>
                    </div>
                  </TableCell>
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
                        isExpanded && "transform rotate-180",
                      )}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
