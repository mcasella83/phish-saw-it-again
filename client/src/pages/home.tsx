import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState } from "react";
import { getShowsByUsername } from "@/lib/phish-api";
import { processShowsData } from "@/lib/phish-processing";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyShows from "./MyShows";
import MySongs from "./MySongs";
import MyVenues from "./MyVenues";
import { PhishShowSetlist, PhishSong } from "@/lib/types";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showsWithSetLists, setShowsWithSetlists] = useState<
    PhishShowSetlist[] | null
  >(null);

  const [songsStats, setSongsStats] = useState<
    PhishSong[] | null
  >(null);

  const [loading, setLoading] = useState(false);
  const [loadingShowCount, setLoadingShowCount] = useState(0);
  const [loadingMaxShowCount, setLoadingMaxShowCount] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (data: User) => {
    try {
      setLoading(true);
      setUser(data);
      const showsData = await getShowsByUsername(data.username);
      console.log("Shows data received:", showsData);

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(Math.min(showsData.data.length, 10));

        const processedShows = await processShowsData(
          showsData,
          (current, total) => setLoadingShowCount(current),
        );

        setShowsWithSetlists(processedShows);

        const song

        
      } else {
        throw new Error(showsData.error_message || "Failed to fetch shows");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setUser(null);
      setShowsWithSetlists(null);

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
    }
  };

  if (user && showsWithSetLists) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user.username}!</h1>
        <Tabs defaultValue="shows" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
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
            <MySongs />
          </TabsContent>
          <TabsContent value="venues">
            <MyVenues />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">
          Welcome to Phish.net Explorer
        </h1>
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
