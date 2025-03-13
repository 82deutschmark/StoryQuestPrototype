import { useQuery, useMutation } from "@tanstack/react-query";
import { StoryNode } from "@/components/game/StoryNode";
import { ChoiceButton } from "@/components/game/ChoiceButton";
import { CharacterCard } from "@/components/game/CharacterCard";
import { MissionTracker } from "@/components/game/MissionTracker";
import { CurrencyDisplay } from "@/components/game/CurrencyDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type Story, type UserProgress } from "@shared/schema";

interface GeneratedStory {
  title: string;
  text: string;
  choices: Array<{
    text: string;
    consequence: string;
    cost: {
      currency: string;
      amount: number;
    };
  }>;
  characters: Array<{
    name: string;
    role: string;
    traits: string[];
    relationshipLevel: number;
  }>;
  mission: {
    title: string;
    description: string;
    reward: {
      currency: string;
      amount: number;
    };
  };
}

interface StoryResponse extends Story {
  generatedStory: GeneratedStory;
}

export default function Game() {
  const { toast } = useToast();

  const { data: story, isLoading: storyLoading } = useQuery<StoryResponse>({
    queryKey: ["/api/story/current"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress>({
    queryKey: ["/api/progress/current"],
  });

  const makeChoiceMutation = useMutation({
    mutationFn: async (choice: any) => {
      return apiRequest("POST", "/api/story/choice", choice);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/story/current"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress/current"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (storyLoading || progressLoading || !story || !progress) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-60 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  const handleChoice = (choice: typeof story.generatedStory.choices[0]) => {
    makeChoiceMutation.mutate(choice);
  };

  const { generatedStory } = story;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <CurrencyDisplay balances={progress.currencyBalances} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <StoryNode
              title={generatedStory.title}
              text={generatedStory.text}
            />

            <div className="space-y-4">
              {generatedStory.choices.map((choice, i) => (
                <ChoiceButton
                  key={i}
                  text={choice.text}
                  cost={choice.cost}
                  onClick={() => handleChoice(choice)}
                  disabled={makeChoiceMutation.isPending}
                />
              ))}
            </div>
          </div>

          <aside className="space-y-8">
            <MissionTracker activeMission={generatedStory.mission} />

            {generatedStory.characters.map((character, i) => (
              <CharacterCard
                key={i}
                name={character.name}
                role={character.role}
                traits={character.traits}
                relationshipLevel={character.relationshipLevel}
              />
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}