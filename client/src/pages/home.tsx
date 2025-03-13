import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg mx-auto">
          <CardContent className="p-6 text-center">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Spy Adventure
            </h1>
            <p className="text-lg mb-8 text-muted-foreground">
              Embark on thrilling missions, make crucial decisions, and shape your destiny
              in a world of espionage and intrigue.
            </p>
            <Button
              size="lg"
              className="w-full mb-4"
              onClick={() => navigate("/game")}
            >
              Start New Game
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => navigate("/load")}
            >
              Load Game
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}