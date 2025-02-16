import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState } from "react";
import { getShowsByUsername } from "@/lib/phish-api";
import {
  processShowsData,
  getUniqueSongsFromSetlists,
  getVenueStatsFromSetlists,
} from "@/lib/phish-processing";
import { useToast } from "@/hooks/use-toast";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { useUser } from "@/lib/stores/user";
import { useAppData } from "@/lib/stores/app-data";
import { useLocation } from "wouter";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [loadingShowCount, setLoadingShowCount] = useState(0);
  const [loadingMaxShowCount, setLoadingMaxShowCount] = useState(0);
  const [currentShowDate, setCurrentShowDate] = useState<string>("");
  const [currentShowVenue, setCurrentShowVenue] = useState<string>("");
  const { toast } = useToast();
  const { user, setUser } = useUser();
  const { setShows, setSongs, setVenues, clearData } = useAppData();
  const [, setLocation] = useLocation();

  const handleSubmit = async (data: User) => {
    try {
      setLoading(true);
      setUser(data);
      clearData(); // Clear existing data when loading new user
      const showsData = await getShowsByUsername(data.username);
      console.log("Shows data received:", showsData);

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(
          Math.min(showsData.data.length, showsData.data.length),
        );

        const processedShows = await processShowsData(
          showsData,
          (current, total, show) => {
            setLoadingShowCount(current);
            if (show) {
              setCurrentShowDate(show.showdate);
              setCurrentShowVenue(show.venue);
            }
          },
        );

        setShows(processedShows);
        // Process songs and venues after shows are loaded
        const processedSongs = getUniqueSongsFromSetlists(processedShows);
        const processedVenues = getVenueStatsFromSetlists(processedShows);
        setSongs(processedSongs);
        setVenues(processedVenues);

        // Navigate to My Shows page after successful data load
        setLocation("/my-shows");
      } else {
        throw new Error(showsData.error_message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setUser(null);
      clearData();

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