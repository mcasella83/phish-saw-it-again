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
import { SongTagsDemo } from "@/components/SongTagsDemo";
import {
  clearShowsCache,
  getCachedSetlist,
  setCachedSetlist,
} from "@/lib/storage-utils";
import Header from "@/components/layout/Header";

import About from "./About";

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

      // Always fetch fresh attendance from phish.net so new shows are detected.
      // Individual setlists are still served from the per-setlist cache so old
      // shows never need an API call; only genuinely new shows hit the network.
      const showsData = await getShowsByUsername(username);
      console.log("Shows data received:", showsData.data.length);

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(showsData.data.length);

        // The attendance list is sorted oldest-first; the last entry is the
        // most recent show.  Always fetch that one fresh — it may still be in
        // progress or have setlist notes being updated.
        const latestShowId =
          showsData.data.length > 0
            ? showsData.data[showsData.data.length - 1].showid
            : undefined;

        if (latestShowId) {
          console.log("Most recent show (always fetched fresh):", latestShowId);
        }

        let processedShows = await processShowsData(showsData, {
          onProgress: (current, total, show) => {
            setLoadingShowCount(current);
            if (show) {
              setCurrentShowDate(show.showdate);
              setCurrentShowVenue(show.venue);
            }
          },
          getCached: getCachedSetlist,
          setCache: setCachedSetlist,
          latestShowId,
        });

        const processedSongs = getUniqueSongsFromSetlists(processedShows);
        const processedVenues = getVenueStatsFromSetlists(processedShows);

        processedShows = processedShows.reverse();

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

  const handleRefresh = async () => {
    if (!user) return;
    clearShowsCache();
    setShowsWithSetlists(null);
    setSongStats(null);
    setVenueStats(null);
    await loadUserData(user.username);
  };

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
      case "login":
      case "shows":
        return (
          <MyShows
            showsWithSetLists={showsWithSetLists ?? []}
            loading={loading}
            loadingShowCount={loadingShowCount}
            loadingMaxShowCount={loadingMaxShowCount}
          />
        );
      case "songs":
        return <MySongs songs={songStats} />;
      case "venues":
        return <MyVenues venues={venueStats} />;
      case "about":
        return <About />;
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
        onRefresh={user ? handleRefresh : undefined}
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
          <div className="flex flex-col gap-8 px-4">
            {initialTab === "about" ? (
              <About />
            ) : (
              <div className="flex items-center justify-center">
                <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
                  <UserForm onSubmit={handleSubmit} />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
