import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { getShowsByUsername, getShowSetList } from "@/lib/phish-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [showsWithSetLists, setShowsWithSetlists] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingShowCount, setLoadingShowCount] = useState(0);
  const [loadingMaxShowCount, setLoadingMaxShowCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (loading) {
      interval = setInterval(() => {
        setLoadingShowCount(count => count + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setLoadingShowCount(0);
    };
  }, [loading]);

  const handleSubmit = async (data: User) => {
    try {
      setLoading(true);
      setUser(data);
      const showsData = await getShowsByUsername(data.username);
      console.log("Shows data received:", showsData);

      let showSetLists = [];

      if (!showsData.error && showsData.data) {
        setLoadingMaxShowCount(showsData.data.length);

        for (let i = 0; i < showsData.data.length; i++) {
          let show = showsData.data[i];
          setLoadingShowCount(i + 1);
          console.log(`processing show #${i}, id=${show.showid}`);

          const showSetList = await getShowSetList(show.showid);
          console.log("Show set list received:", JSON.stringify(showSetList));
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

      // Ensure we're showing the toast with the correct error message
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
            // Group songs by set
            const songsBySet = show.data.reduce((acc: Record<string, any[]>, song: any) => {
              const setKey = song.set;
              if (!acc[setKey]) {
                acc[setKey] = [];
              }
              acc[setKey].push(song);
              return acc;
            }, {});

            return (
              <div key={show.data[0].showid} className="p-4 border rounded-lg">
                <h3 className="font-medium">{show.data[0].venue}</h3>
                <p className="text-sm text-muted-foreground">{show.data[0].location}</p>
                <p className="text-sm">
                  {new Date(show.data[0].showdate).toLocaleDateString()}
                </p>
                <div className="mt-2 space-y-4">
                  {Object.entries(songsBySet).map(([setName, songs]) => (
                    <div key={setName}>
                      <h4 className="font-medium text-sm mb-1">
                        {setName === "E" ? "Encore" : `Set ${setName}`}
                      </h4>
                      <ul className="list-disc list-inside text-sm">
                        {songs.map((song: any) => (
                          <li key={song.uniqueid}>
                            {song.song}
                            {song.transition === 2 && " >"}
                            {song.transition === 3 && " ->"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {show.data[0].setlistnotes && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    <h4 className="font-medium">Notes:</h4>
                    <div dangerouslySetInnerHTML={{ __html: show.data[0].setlistnotes }} />
                  </div>
                )}
              </div>
            )
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