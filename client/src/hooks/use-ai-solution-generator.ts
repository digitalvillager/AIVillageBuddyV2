import { useMutation } from "@tanstack/react-query";
import { useUserPreferences } from "../contexts/user-preferences-context";
import { constructPreferenceAwarePrompt } from "../utils/preference-prompt-constructor";

interface AISolutionResponse {
  solution: string;
  recommendations: string[];
  nextSteps: string[];
  confidence: number;
  reasoning: string;
}

interface GenerateSolutionParams {
  query: string;
  additionalContext?: Record<string, any>;
}

export function useAISolutionGenerator() {
  const { preferences, isLoading: isLoadingPreferences } = useUserPreferences();

  const generateSolution = async ({
    query,
    additionalContext = {},
  }: GenerateSolutionParams): Promise<AISolutionResponse> => {
    const systemPrompt = constructPreferenceAwarePrompt({
      query,
      preferences,
      additionalContext,
    });

    const response = await fetch("/api/generate-solution", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: preferences?.aiReadiness.readinessAssessment.teamAiLiteracy
          ? Math.max(0.3, Math.min(0.9, preferences.aiReadiness.readinessAssessment.teamAiLiteracy / 10))
          : 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate solution");
    }

    const data = await response.json();
    return data;
  };

  const mutation = useMutation({
    mutationFn: generateSolution,
  });

  return {
    generateSolution: mutation.mutate,
    isLoading: mutation.isPending || isLoadingPreferences,
    error: mutation.error,
    solution: mutation.data,
  };
} 