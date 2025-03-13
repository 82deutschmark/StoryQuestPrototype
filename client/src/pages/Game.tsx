
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storyApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { ChevronRight, User, Target, Award, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'wouter';

// Types based on your schema
interface Choice {
  text: string;
  consequence: string;
  currency_requirements: Record<string, number>;
  mission_impact: string;
  type: 'mission-advancing' | 'risky' | 'alternative';
}

interface Character {
  name: string;
  role: string;
  traits?: string[];
  relationshipLevel?: number;
}

interface Mission {
  title: string;
  description: string;
  giver: string;
  target: string;
  objective: string;
  reward_currency: string;
  reward_amount: number;
  deadline: string;
  difficulty: string;
}

interface GeneratedStory {
  title: string;
  story: string;
  choices: Choice[];
  characters: string[];
  mission: Mission;
}

interface StoryResponse {
  story_id: number;
  generated_story: GeneratedStory;
  user_progress: any;
}

export default function Game() {
  const [_, navigate] = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current story from backend
  const { 
    data: storyData, 
    isLoading: storyLoading,
    isError: storyError,
    error: storyErrorData
  } = useQuery<StoryResponse>({
    queryKey: ['currentStory'],
    queryFn: storyApi.getCurrentStory,
    retry: 1,
  });
  
  // Make choice mutation
  const choiceMutation = useMutation({
    mutationFn: storyApi.makeChoice,
    onSuccess: (data) => {
      // Update story data cache
      queryClient.setQueryData(['currentStory'], data);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error making choice",
        description: error.message,
      });
    },
  });
  
  // Handle error state
  useEffect(() => {
    if (storyError) {
      toast({
        variant: "destructive",
        title: "Failed to load story",
        description: "You may need to create a new story first.",
      });
    }
  }, [storyError, toast]);
  
  // Handle choice selection
  const handleChoice = (choice: Choice) => {
    if (storyData) {
      choiceMutation.mutate({
        story_id: storyData.story_id,
        choice_text: choice.text,
        choice_type: choice.type,
        currency_requirements: choice.currency_requirements,
      });
    }
  };
  
  if (storyError) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Active Story</CardTitle>
            <CardDescription>
              You don't have an active story or mission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Create a new story to begin your adventure.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/create')} className="w-full">
              Create New Story
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (storyLoading || !storyData) {
    return (
      <div className="container mx-auto p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  const { generated_story: story, user_progress } = storyData;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{story.title || "Spy Adventure"}</h1>
        
        <div className="flex items-center space-x-4">
          {Object.entries(user_progress.currency_balances).map(([currency, amount]) => (
            <Badge key={currency} variant="outline" className="text-lg px-3 py-1">
              {currency} {amount}
            </Badge>
          ))}
          
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Story Content */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none">
                {story.story.split('\n').map((paragraph, i) => (
                  paragraph ? <p key={i}>{paragraph}</p> : <br key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Choices */}
          <div className="space-y-4">
            {story.choices.map((choice, i) => (
              <Card key={i} className={
                choice.type === 'mission-advancing' ? 'border-green-500 dark:border-green-700' :
                choice.type === 'risky' ? 'border-red-500 dark:border-red-700' :
                'border-blue-500 dark:border-blue-700'
              }>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{choice.text}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    {choice.consequence}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    {Object.entries(choice.currency_requirements).map(([currency, amount]) => (
                      <span key={currency} className="mr-2">
                        {currency} {amount}
                      </span>
                    ))}
                  </div>
                  <Button 
                    onClick={() => handleChoice(choice)}
                    disabled={choiceMutation.isPending}
                    variant="secondary"
                    size="sm"
                  >
                    {choiceMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Mission */}
          {story.mission && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  <CardTitle className="text-lg">Mission</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-bold mb-1">{story.mission.title}</h3>
                <p className="text-sm mb-3">
                  {story.mission.description || story.mission.objective}
                </p>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">From</Badge>
                    <span>{story.mission.giver}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Target</Badge>
                    <span>{story.mission.target}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Reward</Badge>
                    <span>{story.mission.reward_currency} {story.mission.reward_amount}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2">Difficulty</Badge>
                    <span className="capitalize">{story.mission.difficulty}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Characters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {story.characters.map((character, i) => (
                  <div key={i} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{character[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
