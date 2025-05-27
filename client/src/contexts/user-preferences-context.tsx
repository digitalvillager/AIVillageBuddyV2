import { createContext, useContext, ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPreferences, userPreferencesSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<UserPreferences, Error>({
    queryKey: ["/api/user/preferences"],
    queryFn: async () => {
      const res = await fetch("/api/user/preferences");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch preferences");
      }
      const data = await res.json();
      // Validate the data against our schema
      return userPreferencesSchema.parse(data);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Handle errors with toast
  if (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }

  const value: UserPreferencesContextType = {
    preferences: data || null,
    isLoading,
    error: error || null,
    refetch: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
} 