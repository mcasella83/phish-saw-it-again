import { useState } from "react";
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
  const decodedText = utf8.decode(text);
  const doc = new DOMParser().parseFromString(decodedText, "text/html");
  return doc.body.textContent || "";
}

interface MyShowsProps {
  showsWithSetLists: any[] | null;
  loading: boolean;
  loadingShowCount: number;
  loadingMaxShowCount: number;
}

export default function MyShows({ 
  showsWithSetLists, 
  loading, 
  loadingShowCount, 
  loadingMaxShowCount 
}: MyShowsProps) {
  const [expandedShows, setExpandedShows] = useState<Record<string, boolean>>({});
  const [expandedSets, setExpandedSets] = useState<Record<string, boolean>>({});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">
          Loading shows... ({loadingShowCount} out of {loadingMaxShowCount})
        </p>
      </div>
    );
  }

  if (!showsWithSetLists) {
    return null;
  }

  return (
    <div className="space-y-4">
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
  );
}
