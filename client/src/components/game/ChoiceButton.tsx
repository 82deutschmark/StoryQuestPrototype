import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Coins } from "lucide-react";

interface ChoiceButtonProps {
  text: string;
  cost: { currency: string; amount: number };
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ChoiceButton({
  text,
  cost,
  onClick,
  disabled = false,
  className = ""
}: ChoiceButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full ${className}`}
    >
      <Button
        variant="outline"
        className="w-full p-4 h-auto text-left flex items-center gap-3 hover:bg-accent"
        onClick={onClick}
        disabled={disabled}
      >
        <div className="flex-1">
          <p className="text-lg font-medium">{text}</p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Coins className="h-4 w-4" />
          <span>
            {cost.currency} {cost.amount}
          </span>
        </div>
      </Button>
    </motion.div>
  );
}
