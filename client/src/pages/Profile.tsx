
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'wouter';
import { userApi } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Award, ChevronLeft, Target, Sparkles, Heart, PlusCircle, Sword, Shield, ArrowUpRight } from 'lucide-react';

export default function Profile() {
  const [_, navigate] = useNavigate();
  
  // Get user progress data
  const { data: progress, isLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: userApi.getProgress,
  });
  
  if (isLoading || !progress) {
    return (
      <div className="container mx-auto p-4">
        <Skeleton className="h-20 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-64 md:col-span-3" />
        </div>
      </div>
    );
  }
  
  // Calculate XP progress to next level
  const totalXpForLevel = (level: number) => level * level * 100;
  const currentLevelXp = totalXpForLevel(progress.level);
  const nextLevelXp = totalXpForLevel(progress.level + 1);
  const xpProgress = ((progress.experience_points - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/game')}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Game
        </Button>
        <h1 className="text-2xl font-bold ml-4">Agent Profile</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Agent Level */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
              Agent Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">Level {progress.level}</div>
            <Progress value={xpProgress} className="h-2 mb-2" />
            <p className="text-sm text-muted-foreground">
              {progress.experience_points - currentLevelXp} / {nextLevelXp - currentLevelXp} XP to next level
            </p>
          </CardContent>
        </Card>
        
        {/* Finances */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <PlusCircle className="h-5 w-5 mr-2 text-green-500" />
              Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(progress.currency_balances).map(([currency, amount]) => (
                <div key={currency} className="flex justify-between">
                  <span>{currency}</span>
                  <span className="font-medium">{amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Mission Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-blue-500" />
              Mission Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Active Missions</span>
                <span className="font-medium">{progress.active_missions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed</span>
                <span className="font-medium">{progress.completed_missions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed</span>
                <span className="font-medium">{progress.failed_missions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="font-medium">
                  {progress.completed_missions?.length > 0 || progress.failed_missions?.length > 0
                    ? Math.round((progress.completed_missions?.length || 0) / 
                        ((progress.completed_missions?.length || 0) + (progress.failed_missions?.length || 0)) * 100) + '%'
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="relationships">
        <TabsList className="mb-6">
          <TabsTrigger value="relationships">
            <Heart className="h-4 w-4 mr-2" />
            Relationships
          </TabsTrigger>
          <TabsTrigger value="missions">
            <Target className="h-4 w-4 mr-2" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="history">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Choice History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="relationships">
          <Card>
            <CardHeader>
              <CardTitle>Character Relationships</CardTitle>
              <CardDescription>
                Your connections with other characters in the game world
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(progress.encountered_characters || {}).length === 0 ? (
                <p className="text-muted-foreground">
                  You haven't established any meaningful relationships yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(progress.encountered_characters || {}).map(([id, data]: [string, any]) => (
                    <div key={id} className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{data.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{data.name}</h3>
                          <Badge variant={data.relationship_level > 0 ? 'default' : 'destructive'}>
                            {data.relationship_level > 0 ? (
                              <Heart className="h-3 w-3 mr-1" />
                            ) : (
                              <Sword className="h-3 w-3 mr-1" />
                            )}
                            {data.relationship_level > 0 ? '+' : ''}{data.relationship_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Encounters: {data.encounters_count}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="missions">
          <Card>
            <CardHeader>
              <CardTitle>Missions</CardTitle>
              <CardDescription>
                Your active and completed missions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Active Missions */}
                <div>
                  <h3 className="font-medium text-lg mb-3">Active Missions</h3>
                  {(progress.active_missions || []).length === 0 ? (
                    <p className="text-muted-foreground">No active missions.</p>
                  ) : (
                    <div className="space-y-4">
                      {(progress.active_missions || []).map((mission: any) => (
                        <Card key={mission.id}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base">{mission.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm mb-2">{mission.description}</p>
                            <Progress value={mission.progress || 0} className="h-1 mb-2" />
                            <div className="text-sm text-muted-foreground flex justify-between">
                              <span>Progress: {mission.progress || 0}%</span>
                              <span>
                                Reward: {mission.reward_currency} {mission.reward_amount}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Completed Missions */}
                <div>
                  <h3 className="font-medium text-lg mb-3">Completed Missions</h3>
                  {(progress.completed_missions || []).length === 0 ? (
                    <p className="text-muted-foreground">No completed missions.</p>
                  ) : (
                    <div className="space-y-4">
                      {(progress.completed_missions || []).map((mission: any) => (
                        <Card key={mission.id}>
                          <CardHeader className="py-3">
                            <CardTitle className="text-base flex items-center">
                              <Award className="h-4 w-4 mr-2 text-green-500" />
                              {mission.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <p className="text-sm">{mission.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Choice History</CardTitle>
              <CardDescription>
                Past decisions that have shaped your story
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(progress.choice_history || []).length === 0 ? (
                <p className="text-muted-foreground">No choices recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {(progress.choice_history || []).map((choice: any, index: number) => (
                    <div key={index} className="border-l-2 border-primary pl-4 py-2">
                      <p className="font-medium">{choice.choice_text}</p>
                      <p className="text-sm text-muted-foreground">
                        Story #{choice.story_id} • {new Date(choice.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
