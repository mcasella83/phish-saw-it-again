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
import MyShows from "./MyShows";
import MySongs from "./MySongs";
import MyVenues from "./MyVenues";
import { PhishShowSetlist } from "@/lib/types";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { SongTagsDemo } from "@/components/SongTagsDemo"; //Using import style from edited snippet
import {
  clearShowsCache,
  loadShowsFromCache,
  saveShowsToCache,
} from "@/lib/storage-utils";
import Header from "@/components/layout/Header";

const STORAGE_KEY = "phish-explorer-username";

interface HomePageProps {
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function HomePage({
  initialTab = "shows",
  onTabChange,
}: HomePageProps) {
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

      // Try to load from cache first
      const cachedData = loadShowsFromCache();
      if (cachedData) {
        console.log("Loading data from cache");
        setShowsWithSetlists(cachedData.shows);
        setSongStats(cachedData.songs);
        setVenueStats(cachedData.venues);
        return;
      }

      const showsData = await getShowsByUsername(username);
      console.log("Shows data received:", showsData.data.length);

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(showsData.data.length);

        let processedShows = await processShowsData(
          showsData,
          (current, total, show) => {
            setLoadingShowCount(current);
            if (show) {
              setCurrentShowDate(show.showdate);
              setCurrentShowVenue(show.venue);
            }
          },
        );

        const processedSongs = getUniqueSongsFromSetlists(processedShows);
        const processedVenues = getVenueStatsFromSetlists(processedShows);

        processedShows = processedShows.reverse();

        // Save processed data to local storage
        saveShowsToCache({
          shows: processedShows,
          songs: processedSongs,
          venues: processedVenues,
        });

        setShowsWithSetlists(processedShows);
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
      clearShowsCache();
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

  const getContent = () => {
    switch (initialTab) {
      case "shows":
        return (
          <MyShows
            showsWithSetLists={showsWithSetLists}
            loading={loading}
            loadingShowCount={loadingShowCount}
            loadingMaxShowCount={loadingMaxShowCount}
          />
        );
      case "songs":
        return <MySongs songs={songStats} />;
      case "venues":
        return <MyVenues venues={venueStats} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Header
        showNavigation={!!user}
        activeTab={initialTab}
        onTabChange={onTabChange}
        isLoggedIn={!!user}
        username={user?.username || ""}
      />
      {user && showsWithSetLists ? (
        <div className="w-full px-8 pb-8">
          <div className="space-y-4">{getContent()}</div>
        </div>
      ) : (
        <>
          <LoadingModal
            isOpen={loading}
            current={loadingShowCount}
            total={loadingMaxShowCount}
            currentShowDate={currentShowDate}
            currentShowVenue={currentShowVenue}
          />
          <div className="min-h-[80vh] flex items-center justify-center mt-16">
            <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
              <h1 className="text-2xl font-bold text-center mb-6">
                Welcome to Phish.net Explorer
              </h1>
              <UserForm onSubmit={handleSubmit} />
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Sample Song Tags
                </h2>
                <SongTagsDemo />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
