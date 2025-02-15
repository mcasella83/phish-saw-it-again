import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState } from "react";
import { getShowsByUsername, getShowSetList } from "@/lib/phish-api";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MyShows from "./MyShows";
import MySongs from "./MySongs";
import MyVenues from "./MyVenues";
import utf8 from "utf8";
import { PhishShowSetlist } from "@/lib/types";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showsWithSetLists, setShowsWithSetlists] = useState<any[] | null>(
    null,
  );
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

      const LIMIT = 10;
      let showSetLists = [];

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(showsData.data.length);

        for (let i = 0; i < showsData.data.length; i++) {
          if (i >= LIMIT) break;

          let show = showsData.data[i];
          setLoadingShowCount(i + 1);
          console.log(`processing show #${i}, id=${show.showid}`);

          const showSetList: PhishShowSetlist = await getShowSetList(
            show.showid,
          );
          console.log("Show set list received:", JSON.stringify(showSetList));

          if (showSetList?.setListNotes) {
            showSetList.setListNotes = decodeHtmlEntities(
              showSetList.setListNotes,
            );
          }

          showSetLists.push(showSetList);
        }

        setShowsWithSetlists(showSetLists);
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

// Helper function to decode HTML entities and ensure UTF-8
function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  const decodedText = utf8.decode(text);
  const doc = new DOMParser().parseFromString(decodedText, "text/html");
  return doc.body.textContent || "";
}
