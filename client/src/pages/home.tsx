import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";
import { getShowsByUsername, setApiCallCounter } from "@/lib/phish-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useApiCounter } from "@/lib/api-context";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [shows, setShows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const { toast } = useToast();
  const { apiCallCount, incrementApiCallCount } = useApiCounter();

  useEffect(() => {
    setApiCallCounter(incrementApiCallCount);
    return () => setApiCallCounter(null);
  }, [incrementApiCallCount]);

  useEffect(() => {
    let interval: NodeJS.Timer;
    if (loading) {
      interval = setInterval(() => {
        setLoadingCount(count => count + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setLoadingCount(0);
    };
  }, [loading]);

  const handleSubmit = async (data: User) => {
    try {
      setLoading(true);
      setUser(data);
      const showsData = await getShowsByUsername(data.username);
      console.log("Shows data received:", showsData);

      if (!showsData.error && showsData.data) {
        setShows(showsData.data);
      } else {
        throw new Error(showsData.error_message || 'Failed to fetch shows');
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setUser(null);
      setShows(null);

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

  return (
    <div className="min-h-[80vh]">
      <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
        API Calls: {apiCallCount}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            Loading shows... ({loadingCount}s)
          </p>
        </div>
      ) : user && shows ? (
        <div className="max-w-4xl mx-auto py-8">
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Phish Shows</h2>
            {shows.map((show) => (
              <div key={show.showid} className="p-4 border rounded-lg">
                <h3 className="font-medium">{show.venue}</h3>
                <p className="text-sm text-muted-foreground">{show.location}</p>
                <p className="text-sm">
                  {new Date(show.showdate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
            <h1 className="text-2xl font-bold text-center mb-6">
              Welcome to Phish.net Explorer
            </h1>
            <UserForm onSubmit={handleSubmit} />
          </div>
        </div>
      )}
    </div>
  );
}