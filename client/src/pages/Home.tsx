
import { useNavigate } from 'wouter';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';

export default function Home() {
  const [_, navigate] = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight">SpyMaster</h1>
        <p className="text-xl text-muted-foreground mt-2">
          An AI-powered spy thriller adventure
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>New Adventure</CardTitle>
            <CardDescription>
              Create a new spy story with unique settings and characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Choose your conflict, setting, narrative style and mood to craft a unique adventure.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/create')} className="w-full">
              Start New Story
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Continue</CardTitle>
            <CardDescription>
              Resume your current mission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Jump back into your active mission and continue your adventure.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/game')} variant="outline" className="w-full">
              Continue Story
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              View your agent profile and accomplishments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Check your level, currency balance, completed missions, and character relationships.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/profile')} variant="secondary" className="w-full">
              View Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
