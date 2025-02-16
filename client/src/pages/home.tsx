import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { getShowsByUsername } from "@/lib/phish-api";
import {
  processShowsData,
  getUniqueSongsFromSetlists,
  getVenueStatsFromSetlists,
  type SongStats,
  type VenueStats,
} from "@/lib/phish-processing";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyShows from "./MyShows";
import MySongs from "./MySongs";
import MyVenues from "./MyVenues";
import { PhishShowSetlist } from "@/lib/types";
import { LoadingModal } from "@/components/ui/LoadingModal";

const STORAGE_KEY = "phish-explorer-username";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showsWithSetLists, setShowsWithSetlists] = useState<
    PhishShowSetlist[] | null
  >(null);
  const [songStats, setSongStats] = useState<SongStats[] | null>(null);
  const [venueStats, setVenueStats] = useState<VenueStats[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingShowCount, setLoadingShowCount] = useState(0);
  const [loadingMaxShowCount, setLoadingMaxShowCount] = useState(0);
  const [currentShowDate, setCurrentShowDate] = useState<string>("");
  const [currentShowVenue, setCurrentShowVenue] = useState<string>("");
  const { toast } = useToast();

  const loadUserData = async (username: string) => {
    try {
      setLoading(true);
      const userData: User = { username };
      setUser(userData);
      const showsData = await getShowsByUsername(username);
      console.log("Shows data received:", showsData);

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(
          Math.min(showsData.data.length, showsData.data.length)
        );

        const processedShows = await processShowsData(
          showsData,
          (current, total, show) => {
            setLoadingShowCount(current);
            if (show) {
              setCurrentShowDate(show.showdate);
              setCurrentShowVenue(show.venue);
            }
          }
        );

        setShowsWithSetlists(processedShows);
        const processedSongs = getUniqueSongsFromSetlists(processedShows);
        const processedVenues = getVenueStatsFromSetlists(processedShows);
        setSongStats(processedSongs);
        setVenueStats(processedVenues);
      } else {
        throw new Error(showsData.error_message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("Error in loadUserData:", error);
      setUser(null);
      setShowsWithSetlists(null);
      setSongStats(null);
      setVenueStats(null);
      localStorage.removeItem(STORAGE_KEY);

      toast({
        title: "Failed to fetch shows",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingShowCount(0);
      setLoadingMaxShowCount(0);
      setCurrentShowDate("");
      setCurrentShowVenue("");
    }
  };

  useEffect(() => {
    const savedUsername = localStorage.getItem(STORAGE_KEY);
    if (savedUsername) {
      loadUserData(savedUsername);
    }
  }, []);

  const handleSubmit = async (data: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, data.username);
      await loadUserData(data.username);
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      throw error;
    }
  };

  if (user && showsWithSetLists) {
    return (
      <div className="w-full px-8 py-8">
        <div className="max-w-4xl mx-auto mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user.username}!</h1>
          <button
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setUser(null);
              setShowsWithSetlists(null);
              setSongStats(null);
              setVenueStats(null);
            }}
            className="text-sm text-muted-foreground hover:text-foreground mt-2"
          >
            Sign Out
          </button>
        </div>
        <Tabs defaultValue="shows" className="space-y-4">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-3">
            <TabsTrigger value="shows">My Shows</TabsTrigger>
            <TabsTrigger value="songs">My Songs</TabsTrigger>
            <TabsTrigger value="venues">My Venues</TabsTrigger>
          </TabsList>
          <TabsContent value="shows">
            <MyShows
              showsWithSetLists={showsWithSetLists}
              loading={loading}
              loadingShowCount={loadingShowCount}
              loadingMaxShowCount={loadingMaxShowCount}
            />
          </TabsContent>
          <TabsContent value="songs">
            <MySongs songs={songStats} />
          </TabsContent>
          <TabsContent value="venues">
            <MyVenues venues={venueStats} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <>
      <LoadingModal
        isOpen={loading}
        current={loadingShowCount}
        total={loadingMaxShowCount}
        currentShowDate={currentShowDate}
        currentShowVenue={currentShowVenue}
      />
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-center mb-6">
            Welcome to Phish.net Explorer
          </h1>
          <UserForm onSubmit={handleSubmit} />
        </div>
      </div>
    </>
  );
}