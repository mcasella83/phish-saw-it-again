import { useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, decodeHtmlEntities } from "@/lib/utils";
import { PhishSetlistApiResponse } from "@/lib/types";

interface MyShowsProps {
  showsWithSetLists: PhishSetlistApiResponse[];
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

  if (!showsWithSetLists || showsWithSetLists.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showsWithSetLists.map((showData) => {
        if (!showData.data || !showData.data.setlist) {
          return null;
        }

        const songsBySet = showData.data.setlist.reduce(
          (acc: Record<string, typeof showData.data.setlist>, song) => {
            const setKey = song.set;
            if (!acc[setKey]) {
              acc[setKey] = [];
            }
            acc[setKey].push(song);
            return acc;
          },
          {}
        );

        const showId = showData.data.showid;
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
                  <h3 className="font-medium">{showData.data.venue}</h3>
                  <p className="text-sm text-muted-foreground">
                    {showData.data.location}
                  </p>
                  <p className="text-sm">
                    {new Date(showData.data.showdate).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-2">
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "transform rotate-180"
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
                                isSetExpanded && "transform rotate-180"
                              )}
                            />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-2">
                          <ol className="list-decimal list-inside text-sm space-y-1">
                            {songs.map((song) => (
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
                {showData.data.setlistnotes && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <h4 className="font-medium">Notes:</h4>
                    <div
                      className="whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: decodeHtmlEntities(showData.data.setlistnotes),
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