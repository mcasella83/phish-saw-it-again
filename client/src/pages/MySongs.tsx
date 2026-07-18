import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { SongStats } from "@/lib/phish-processing";

type SortColumn = "name" | "playCount" | "firstSeen" | "lastSeen";
type SortDirection = "asc" | "desc";

interface MySongsProps {
  songs: SongStats[] | null;
}

function SortIcon({ column, sortColumn, sortDirection }: { column: SortColumn; sortColumn: SortColumn; sortDirection: SortDirection }) {
  if (sortColumn !== column) return <ChevronsUpDown className="inline-block ml-1 h-3.5 w-3.5 opacity-40" />;
  return sortDirection === "asc"
    ? <ChevronUp className="inline-block ml-1 h-3.5 w-3.5" />
    : <ChevronDown className="inline-block ml-1 h-3.5 w-3.5" />;
}

export default function MySongs({ songs }: MySongsProps) {
  const [expandedSongs, setExpandedSongs] = useState<Record<string, boolean>>({});
  const [sortColumn, setSortColumn] = useState<SortColumn>("playCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [search, setSearch] = useState("");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "name" ? "asc" : "desc");
    }
  };

  const sortedSongs = useMemo(() => {
    if (!songs) return [];
    const filtered = search.trim()
      ? songs.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
      : songs;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortColumn === "name") {
        cmp = a.name.localeCompare(b.name);
      } else if (sortColumn === "playCount") {
        cmp = a.playCount - b.playCount;
      } else if (sortColumn === "firstSeen") {
        cmp = (a.occurrences[0] ?? "").localeCompare(b.occurrences[0] ?? "");
      } else if (sortColumn === "lastSeen") {
        const aLast = a.occurrences[a.occurrences.length - 1] ?? "";
        const bLast = b.occurrences[b.occurrences.length - 1] ?? "";
        cmp = aLast.localeCompare(bLast);
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });
  }, [songs, sortColumn, sortDirection]);

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

  const headerClass = "cursor-pointer select-none hover:text-foreground whitespace-nowrap";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">My Songs ({sortedSongs.length}{search.trim() ? ` of ${songs.length}` : ""})</h2>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search songs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn("min-w-[200px]", headerClass)} onClick={() => handleSort("name")}>
                Song Name <SortIcon column="name" sortColumn={sortColumn} sortDirection={sortDirection} />
              </TableHead>
              <TableHead className={cn("w-24 text-right", headerClass)} onClick={() => handleSort("playCount")}>
                Times <SortIcon column="playCount" sortColumn={sortColumn} sortDirection={sortDirection} />
              </TableHead>
              <TableHead className={cn("hidden md:table-cell", headerClass)} onClick={() => handleSort("firstSeen")}>
                First Seen <SortIcon column="firstSeen" sortColumn={sortColumn} sortDirection={sortDirection} />
              </TableHead>
              <TableHead className={cn("hidden md:table-cell", headerClass)} onClick={() => handleSort("lastSeen")}>
                Last Seen <SortIcon column="lastSeen" sortColumn={sortColumn} sortDirection={sortDirection} />
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSongs.map((song) => {
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
                          isExpanded && "transform rotate-180",
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
                              {date}
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
