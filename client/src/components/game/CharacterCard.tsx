import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CharacterCardProps {
  name: string;
  role: string;
  traits: string[];
  relationshipLevel: number;
  imageUrl?: string;
}

export function CharacterCard({
  name,
  role,
  traits,
  relationshipLevel,
  imageUrl
}: CharacterCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Relationship</h4>
          <Progress value={relationshipLevel * 10} className="h-2" />
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Traits</h4>
          <div className="flex flex-wrap gap-2">
            {traits.map((trait, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-full bg-accent text-accent-foreground"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
