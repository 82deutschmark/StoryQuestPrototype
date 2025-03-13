import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface CurrencyBalance {
  "💎": number;
  "💷": number;
  "💶": number;
  "💴": number;
  "💵": number;
}

interface CurrencyDisplayProps {
  balances: CurrencyBalance;
}

export function CurrencyDisplay({ balances }: CurrencyDisplayProps) {
  return (
    <div className="flex items-center gap-4">
      {(Object.entries(balances) as [keyof CurrencyBalance, number][]).map(
        ([currency, amount]) => (
          <HoverCard key={currency}>
            <HoverCardTrigger asChild>
              <button className="text-lg hover:scale-110 transition-transform">
                <span className="mr-1">{currency}</span>
                <span className="font-mono">{amount.toLocaleString()}</span>
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto">
              <div className="text-sm">
                {currency === "💎" && "Premium Currency"}
                {currency === "💷" && "British Pounds"}
                {currency === "💶" && "Euros"}
                {currency === "💴" && "Yen"}
                {currency === "💵" && "US Dollars"}
              </div>
            </HoverCardContent>
          </HoverCard>
        )
      )}
    </div>
  );
}
