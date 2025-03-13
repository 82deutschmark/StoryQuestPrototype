
import { useState, useEffect } from 'react';
import { useNavigate } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { storyApi } from '../lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../hooks/use-toast';
import { Loader2 } from 'lucide-react';

type StoryOption = [string, string]; // [emoji, description]
type StoryOptions = {
  conflicts: StoryOption[];
  settings: StoryOption[];
  narrative_styles: StoryOption[];
  moods: StoryOption[];
};

export default function StoryCreate() {
  const [_, navigate] = useNavigate();
  const { toast } = useToast();
  
  // Story parameters
  const [selectedConflict, setSelectedConflict] = useState<string>('');
  const [selectedSetting, setSelectedSetting] = useState<string>('');
  const [selectedNarrativeStyle, setSelectedNarrativeStyle] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [useCustom, setUseCustom] = useState<boolean>(false);
  const [customConflict, setCustomConflict] = useState<string>('');
  const [customSetting, setCustomSetting] = useState<string>('');
  const [customNarrative, setCustomNarrative] = useState<string>('');
  const [customMood, setCustomMood] = useState<string>('');
  const [protagonistName, setProtagonistName] = useState<string>('');
  const [protagonistGender, setProtagonistGender] = useState<string>('');
  
  // Get story options from API
  const { data: storyOptions, isLoading: optionsLoading } = useQuery<StoryOptions>({
    queryKey: ['storyOptions'],
    queryFn: storyApi.getOptions,
  });
  
  // Generate story mutation
  const generateStoryMutation = useMutation({
    mutationFn: storyApi.generateStory,
    onSuccess: (data) => {
      toast({
        title: "Story Created",
        description: "Your new adventure is ready to begin!",
      });
      navigate('/game');
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create story",
        description: error.message,
      });
    },
  });
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!useCustom && (!selectedConflict || !selectedSetting || !selectedNarrativeStyle || !selectedMood)) {
      toast({
        variant: "destructive",
        title: "Missing selections",
        description: "Please select all story options or use custom entries",
      });
      return;
    }
    
    if (useCustom && (!customConflict || !customSetting || !customNarrative || !customMood)) {
      toast({
        variant: "destructive",
        title: "Missing custom entries",
        description: "Please fill in all custom story options",
      });
      return;
    }
    
    // Submit form
    generateStoryMutation.mutate({
      conflict: selectedConflict,
      setting: selectedSetting,
      narrative_style: selectedNarrativeStyle,
      mood: selectedMood,
      custom_conflict: useCustom ? customConflict : undefined,
      custom_setting: useCustom ? customSetting : undefined,
      custom_narrative: useCustom ? customNarrative : undefined,
      custom_mood: useCustom ? customMood : undefined,
      protagonist_name: protagonistName || undefined,
      protagonist_gender: protagonistGender || undefined,
    });
  };
  
  if (optionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Create Your Spy Adventure</h1>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Story Parameters</CardTitle>
            <CardDescription>
              Choose the elements that will shape your adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Conflict Selection */}
                <div className="space-y-2">
                  <Label htmlFor="conflict">Conflict</Label>
                  <Select
                    disabled={useCustom}
                    value={selectedConflict}
                    onValueChange={setSelectedConflict}
                  >
                    <SelectTrigger id="conflict">
                      <SelectValue placeholder="Select a conflict" />
                    </SelectTrigger>
                    <SelectContent>
                      {storyOptions?.conflicts.map(([emoji, desc]) => (
                        <SelectItem key={desc} value={desc}>
                          {emoji} {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Setting Selection */}
                <div className="space-y-2">
                  <Label htmlFor="setting">Setting</Label>
                  <Select
                    disabled={useCustom}
                    value={selectedSetting}
                    onValueChange={setSelectedSetting}
                  >
                    <SelectTrigger id="setting">
                      <SelectValue placeholder="Select a setting" />
                    </SelectTrigger>
                    <SelectContent>
                      {storyOptions?.settings.map(([emoji, desc]) => (
                        <SelectItem key={desc} value={desc}>
                          {emoji} {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Narrative Style Selection */}
                <div className="space-y-2">
                  <Label htmlFor="narrative">Narrative Style</Label>
                  <Select
                    disabled={useCustom}
                    value={selectedNarrativeStyle}
                    onValueChange={setSelectedNarrativeStyle}
                  >
                    <SelectTrigger id="narrative">
                      <SelectValue placeholder="Select a narrative style" />
                    </SelectTrigger>
                    <SelectContent>
                      {storyOptions?.narrative_styles.map(([emoji, desc]) => (
                        <SelectItem key={desc} value={desc}>
                          {emoji} {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Mood Selection */}
                <div className="space-y-2">
                  <Label htmlFor="mood">Mood</Label>
                  <Select
                    disabled={useCustom}
                    value={selectedMood}
                    onValueChange={setSelectedMood}
                  >
                    <SelectTrigger id="mood">
                      <SelectValue placeholder="Select a mood" />
                    </SelectTrigger>
                    <SelectContent>
                      {storyOptions?.moods.map(([emoji, desc]) => (
                        <SelectItem key={desc} value={desc}>
                          {emoji} {desc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-4">
                <input
                  type="checkbox"
                  id="useCustom"
                  checked={useCustom}
                  onChange={() => setUseCustom(!useCustom)}
                  className="h-4 w-4"
                />
                <Label htmlFor="useCustom">Use custom values instead</Label>
              </div>
              
              {useCustom && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="customConflict">Custom Conflict</Label>
                    <Input
                      id="customConflict"
                      value={customConflict}
                      onChange={(e) => setCustomConflict(e.target.value)}
                      placeholder="e.g., Stolen nuclear codes"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customSetting">Custom Setting</Label>
                    <Input
                      id="customSetting"
                      value={customSetting}
                      onChange={(e) => setCustomSetting(e.target.value)}
                      placeholder="e.g., Underground bunker in Moscow"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customNarrative">Custom Narrative Style</Label>
                    <Input
                      id="customNarrative"
                      value={customNarrative}
                      onChange={(e) => setCustomNarrative(e.target.value)}
                      placeholder="e.g., Hard-boiled detective style"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customMood">Custom Mood</Label>
                    <Input
                      id="customMood"
                      value={customMood}
                      onChange={(e) => setCustomMood(e.target.value)}
                      placeholder="e.g., Tense and paranoid"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Protagonist</CardTitle>
            <CardDescription>
              Optional details about your character
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="protagonistName">Agent Name (Optional)</Label>
                <Input
                  id="protagonistName"
                  value={protagonistName}
                  onChange={(e) => setProtagonistName(e.target.value)}
                  placeholder="e.g., Agent Blackwood"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="protagonistGender">Agent Gender (Optional)</Label>
                <Select
                  value={protagonistGender}
                  onValueChange={setProtagonistGender}
                >
                  <SelectTrigger id="protagonistGender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={generateStoryMutation.isPending}
          >
            {generateStoryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Create Story"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
