import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { useAISolutionGenerator } from "@/hooks/use-ai-solution-generator";
import { useUserPreferences } from "@/contexts/user-preferences-context";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export function AISolutionGenerator() {
  const [query, setQuery] = useState("");
  const { generateSolution, isLoading, error, solution } = useAISolutionGenerator();
  const { preferences } = useUserPreferences();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    generateSolution({ query });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please set up your preferences before generating AI solutions.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Solution Generator</CardTitle>
          <CardDescription>
            Generate AI solutions based on your preferences and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Describe your problem or question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Solution...
                </>
              ) : (
                "Generate Solution"
              )}
            </Button>
          </form>

          {error && (
            <Card className="p-4 bg-destructive/10 text-destructive">
              <p>Error: {error.message}</p>
            </Card>
          )}

          {solution && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Solution</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        Confidence: {Math.round(solution.confidence * 100)}%
                      </span>
                      <Progress value={solution.confidence * 100} className="w-24" />
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{solution.solution}</p>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <ul className="list-disc list-inside space-y-2">
                  {solution.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
                <ul className="list-disc list-inside space-y-2">
                  {solution.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Reasoning</h3>
                <p className="text-muted-foreground">{solution.reasoning}</p>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 