import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface StoryNodeProps {
  title: string;
  text: string;
  className?: string;
}

export function StoryNode({ title, text, className = "" }: StoryNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`w-full max-w-4xl mx-auto ${className}`}>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-lg leading-relaxed whitespace-pre-wrap">{text}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
