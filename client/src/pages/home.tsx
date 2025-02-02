import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState } from "react";
import { getPhishShows } from "@/lib/phish-api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [shows, setShows] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: User) => {
    try {
      setLoading(true);
      await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      setUser(data);
      const showsData = await getPhishShows();
      if (!showsData.error && showsData.data) {
        setShows(showsData.data);
      } else {
        throw new Error(showsData.error_message || 'Failed to fetch shows');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Phish.net data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user && shows) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Phish Shows</h2>
          {shows.map((show) => (
            <div key={show.showid} className="p-4 border rounded-lg">
              <h3 className="font-medium">{show.venue}</h3>
              <p className="text-sm text-muted-foreground">{show.location}</p>
              <p className="text-sm">{new Date(show.showdate).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Phish.net Explorer</h1>
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}