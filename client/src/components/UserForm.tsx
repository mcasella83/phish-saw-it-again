import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema, type User } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserFormProps {
  onSubmit: (data: User) => void;
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const form = useForm<User>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your username"
                  autoComplete="off"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                ⚠️ Username is case-sensitive — use the exact capitalisation from your phish.net profile.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Step into the freezer...
        </Button>
      </form>
    </Form>
  );
}
