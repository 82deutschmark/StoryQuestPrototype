import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Award } from "lucide-react";

interface Mission {
  title: string;
  description: string;
  reward: {
    currency: string;
    amount: number;
  };
}

interface MissionTrackerProps {
  activeMission: Mission;
}

export function MissionTracker({ activeMission }: MissionTrackerProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Target className="h-5 w-5 text-primary" />
        <CardTitle className="text-lg">Active Mission</CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold mb-2">{activeMission.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {activeMission.description}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <Award className="h-4 w-4" />
          <span>Reward: </span>
          <span className="font-bold">
            {activeMission.reward.currency} {activeMission.reward.amount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
