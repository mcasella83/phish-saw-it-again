import UserForm from "@/components/UserForm";
import type { User } from "@shared/schema";
import { useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  const handleSubmit = (data: User) => {
    setUser(data);
  };

  if (user) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome, {user.username}!</h1>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome</h1>
        <UserForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
