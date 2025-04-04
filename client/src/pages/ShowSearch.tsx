import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Music } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PhishShow } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { SearchResults, SongStat, searchShows, processShowsForSongStats } from "@/lib/phish-api";

export interface ShowSearchProps {
  // Any props if needed
}

type Artist = "all" | "phish" | "trey";

export default function ShowSearch() {
  const [artist, setArtist] = useState<Artist>("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingSetlists, setIsProcessingSetlists] = useState(false);
  const [currentProcessingShow, setCurrentProcessingShow] = useState<number>(0);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("shows");

  const handleSearch = async () => {
    if (!startDate) {
      setError("Please select a start date");
      return;
    }

    if (!endDate) {
      setError("Please select an end date");
      return;
    }

    // Reset error state and previous results
    setError(null);
    setSearchResults(null);
    setIsLoading(true);
    setHasSearched(true);
    setIsProcessingSetlists(false);
    setCurrentProcessingShow(0);
    setActiveTab("shows");

    try {
      // Format dates as YYYY-MM-DD
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      // Fetch the shows data
      const showsData = await searchShows(formattedStartDate, formattedEndDate, artist);
      
      // Filter shows to ensure they're within the selected date range
      const startDateObj = new Date(formattedStartDate);
      const endDateObj = new Date(formattedEndDate);
      
      const filteredShows = showsData.data.filter(show => {
        const showDate = new Date(show.showdate);
        return showDate >= startDateObj && showDate <= endDateObj;
      });
      
      // Update the response with filtered shows
      showsData.data = filteredShows;
      
      if (showsData.data.length === 0) {
        setSearchResults({
          shows: [],
          songs: [],
          totalSongs: 0,
          uniqueSongs: 0
        });
        setIsLoading(false);
        return;
      }

      // Now process the setlists in a separate step
      setIsLoading(false);
      setIsProcessingSetlists(true);
      
      // Process the shows data to get song statistics
      // This could take some time for many shows
      const totalShows = showsData.data.length;
      
      // Set up progress tracking
      const processShowWithProgress = async () => {
        try {
          // We'll process the shows and track progress
          const results = await processShowsForSongStats(
            showsData.data, 
            (current, total) => {
              setCurrentProcessingShow(current + 1);
            }
          );
          setSearchResults(results);
        } catch (err) {
          console.error("Error processing shows:", err);
          setError("Error processing song data. Some show information may be incomplete.");
          // Still set partial results if we have them
          if (searchResults) {
            setSearchResults({
              ...searchResults,
              shows: showsData.data
            });
          } else {
            setSearchResults({
              shows: showsData.data,
              songs: [],
              totalSongs: 0,
              uniqueSongs: 0
            });
          }
        } finally {
          setIsProcessingSetlists(false);
        }
      };

      // Start processing
      processShowWithProgress();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setSearchResults(null);
      setIsLoading(false);
      setIsProcessingSetlists(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Show Search</h1>
        <p className="text-muted-foreground">
          Search for shows by artist and date range, and view song statistics
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
          <Button onClick={handleSearch} disabled={isLoading || isProcessingSetlists} className="w-full">
            {isLoading ? "Searching..." : isProcessingSetlists ? "Processing..." : "Search"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {(isLoading || isProcessingSetlists) && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>
              {isLoading ? "Searching for shows..." : "Processing setlists..."}
            </CardTitle>
            <CardDescription>
              {isLoading 
                ? "Fetching shows matching your criteria" 
                : "Analyzing song data from the setlists"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={isProcessingSetlists ? (currentProcessingShow / (searchResults?.shows.length || 1)) * 100 : 50} />
              <p className="text-sm text-muted-foreground">
                {isLoading 
                  ? "This should only take a moment..." 
                  : isProcessingSetlists
                    ? `Processing show ${currentProcessingShow} of ${searchResults?.shows.length || '...'}`
                    : "This may take a little while for many shows"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isProcessingSetlists && hasSearched && searchResults && searchResults.shows.length === 0 && !error && (
        <div className="text-center p-8">
          <h3 className="text-xl font-semibold">No shows found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}

      {!isLoading && !isProcessingSetlists && searchResults && searchResults.shows.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shows">Shows ({searchResults.shows.length})</TabsTrigger>
            <TabsTrigger value="songs">Songs ({searchResults.uniqueSongs})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shows" className="mt-4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                Found {searchResults.shows.length} shows
              </h2>
              <p className="text-muted-foreground">
                Matching your search criteria
              </p>
            </div>
            
            <div className="space-y-4">
              {searchResults.shows.map((show) => (
                <Card key={show.showid}>
                  <CardHeader className="pb-2">
                    <CardTitle>{format(new Date(show.showdate), "MMMM d, yyyy")}</CardTitle>
                    <CardDescription>{show.artist_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{show.venue}</p>
                    <p className="text-muted-foreground">{show.location}</p>
                  </CardContent>
                  {show.rating > 0 && (
                    <CardFooter>
                      <Badge variant="outline">Rating: {show.rating.toFixed(2)}</Badge>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="songs" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Song Analysis</CardTitle>
                <CardDescription>
                  Found {searchResults.totalSongs} total song plays across {searchResults.uniqueSongs} unique songs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Song</TableHead>
                      <TableHead className="w-[100px] text-right">Play Count</TableHead>
                      <TableHead className="w-[180px] text-right">% of Shows</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.songs.map((song) => (
                      <TableRow key={song.name}>
                        <TableCell className="font-medium">{song.name}</TableCell>
                        <TableCell className="text-right">{song.playCount}</TableCell>
                        <TableCell className="text-right">
                          {((song.shows.length / searchResults.shows.length) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}