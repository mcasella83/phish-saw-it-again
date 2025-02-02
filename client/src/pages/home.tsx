import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { getShowsByUsername, getShowSetList } from "@/lib/phish-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import utf8 from "utf8";

// Helper function to decode HTML entities and ensure UTF-8
function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  // First decode UTF-8
  const decodedText = utf8.decode(text);
  // Then parse HTML entities
  const doc = new DOMParser().parseFromString(decodedText, "text/html");
  return doc.body.textContent || "";
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showsWithSetLists, setShowsWithSetlists] = useState<any[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [loadingShowCount, setLoadingShowCount] = useState(0);
  const [loadingMaxShowCount, setLoadingMaxShowCount] = useState(0);
  const [expandedShows, setExpandedShows] = useState<Record<string, boolean>>(
    {},
  );
  const [expandedSets, setExpandedSets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleSubmit = async (data: User) => {
    try {
      setLoading(true);
      setUser(data);
      const showsData = await getShowsByUsername(data.username);
      console.log("Shows data received:", showsData);

      const LIMIT = 1;

      let showSetLists = [];

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(showsData.data.length);

        for (let i = 0; i < showsData.data.length; i++) {
          if (i >= LIMIT) break;

          let show = showsData.data[i];
          setLoadingShowCount(i + 1);
          console.log(`processing show #${i}, id=${show.showid}`);

          const showSetList = await getShowSetList(show.showid);
          console.log("Show set list received:", JSON.stringify(showSetList));

          // Decode setlist notes before storing
          if (showSetList.data?.[0]?.setlistnotes) {
            showSetList.data[0].setlistnotes = decodeHtmlEntities(showSetList.data[0].setlistnotes);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">
          Loading shows... ({loadingShowCount} out of {loadingMaxShowCount})
        </p>
      </div>
    );
  }

  if (user && showsWithSetLists) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Phish Shows</h2>
          {showsWithSetLists.map((show) => {
            const songsBySet = show.data.reduce(
              (acc: Record<string, any[]>, song: any) => {
                const setKey = song.set;
                if (!acc[setKey]) {
                  acc[setKey] = [];
                }
                acc[setKey].push(song);
                return acc;
              },
              {},
            );

            const showId = show.data[0].showid;
            const isExpanded = expandedShows[showId] || false;

            return (
              <Collapsible
                key={showId}
                open={isExpanded}
                onOpenChange={(open) =>
                  setExpandedShows((prev) => ({ ...prev, [showId]: open }))
                }
                className="border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <CollapsibleTrigger className="w-full">
                  <div className="p-4 flex items-start justify-between cursor-pointer">
                    <div>
                      <h3 className="font-medium">{show.data[0].venue}</h3>
                      <p className="text-sm text-muted-foreground">
                        {show.data[0].location}
                      </p>
                      <p className="text-sm">
                        {new Date(show.data[0].showdate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-2">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          isExpanded && "transform rotate-180",
                        )}
                      />
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    {Object.entries(songsBySet).map(([setName, songs]) => {
                      const setKey = `${showId}-${setName}`;
                      const isSetExpanded = expandedSets[setKey] || false;

                      return (
                        <Collapsible
                          key={setKey}
                          open={isSetExpanded}
                          onOpenChange={(open) =>
                            setExpandedSets((prev) => ({
                              ...prev,
                              [setKey]: open,
                            }))
                          }
                          className="border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="p-2 flex items-center justify-between bg-muted/50 cursor-pointer">
                              <h4 className="font-medium text-sm">
                                {setName === "e" ? "Encore" : `Set ${setName}`}
                              </h4>
                              <div className="p-1">
                                <ChevronDown
                                  className={cn(
                                    "h-3 w-3 transition-transform duration-200",
                                    isSetExpanded && "transform rotate-180",
                                  )}
                                />
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="p-2">
                              <ol className="list-decimal list-inside text-sm space-y-1">
                                {songs.map((song: any, index: number) => (
                                  <li key={song.uniqueid} className="text-sm">
                                    {song.song}
                                    {song.transition === 2 && " >"}
                                    {song.transition === 3 && " ->"}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                    {show.data[0].setlistnotes && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        <h4 className="font-medium">Notes:</h4>
                        <div
                          className="whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: show.data[0].setlistnotes,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
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