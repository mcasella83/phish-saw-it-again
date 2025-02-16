import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SongStats } from "@/lib/phish-processing";
import { useUser } from "@/lib/stores/user";

export default function MySongs() {
  const [songs, setSongs] = useState<SongStats[] | null>(null);
  const user = useUser((state) => state.user);

  useEffect(() => {
    // If we navigate directly to this page and don't have a user,
    // we'll redirect to home in a future update
    if (!user) return;

    // For now, we'll just show the empty state
    // In a future update, we'll fetch songs for the current user
  }, [user]);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.map((song) => (
              <TableRow key={song.name}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}