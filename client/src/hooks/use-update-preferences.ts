import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPreferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface UpdatePreferencesContext {
  previousData: UserPreferences | undefined;
}

export function useUpdatePreferences() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<UserPreferences, Error, UserPreferences, UpdatePreferencesContext>({
    mutationFn: async (data: UserPreferences) => {
      const res = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update preferences");
      }
      return res.json();
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/user/preferences"] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<UserPreferences>(["/api/user/preferences"]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(["/api/user/preferences"], newData);
      
      return { previousData };
    },
    onError: (error, newData, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["/api/user/preferences"], context.previousData);
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      toast({
        title: "Success",
        description: "Your preferences have been updated successfully.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
    },
  });
} 