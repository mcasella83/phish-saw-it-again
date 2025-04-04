import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhishShow, PhishShowApiResponse } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export interface ShowSearchProps {
  // Any props if needed
}

type Artist = "all" | "phish" | "trey";

export default function ShowSearch() {
  const [artist, setArtist] = useState<Artist>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<PhishShow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!startDate) {
      setError("Please select a start date");
      return;
    }

    if (!endDate) {
      setError("Please select an end date");
      return;
    }

    // Reset error state
    setError(null);
    setIsLoading(true);
    setHasSearched(true);

    try {
      // Format dates as YYYY-MM-DD
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // Build query string
      const queryParams = new URLSearchParams({
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        artist: artist,
      });

      // Make API request
      const response = await fetch(`/api/phish/search?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch shows");
      }

      const data: PhishShowApiResponse = await response.json();
      
      if (data.error && data.error_message) {
        throw new Error(data.error_message);
      }

      setSearchResults(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Show Search</h1>
        <p className="text-muted-foreground">
          Search for shows by artist and date range
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Artist</label>
          <Select value={artist} onValueChange={(value) => setArtist(value as Artist)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an artist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="phish">Phish</SelectItem>
              <SelectItem value="trey">Trey Solo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium leading-none mb-2 block">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="text-sm font-medium leading-none mb-2 block">End Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick an end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-end">
          <Button onClick={handleSearch} disabled={isLoading} className="w-full">
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && hasSearched && searchResults.length === 0 && !error && (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold">No shows found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Found {searchResults.length} shows
          </h2>
          <div className="space-y-4">
            {searchResults.map((show) => (
              <Card key={show.showid}>
                <CardHeader className="pb-2">
                  <CardTitle>{format(new Date(show.showdate), "MMMM d, yyyy")}</CardTitle>
                  <CardDescription>{show.artist_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{show.venue}</p>
                  <p className="text-muted-foreground">{show.location}</p>
                  {show.rating > 0 && (
                    <div className="mt-2 text-sm">
                      Rating: {show.rating.toFixed(2)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}