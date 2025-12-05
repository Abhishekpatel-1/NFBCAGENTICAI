import { LOAN_AMOUNTS } from '@/types/loan';
import { formatCurrency } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IndianRupee } from 'lucide-react';

interface LoanAmountSelectorProps {
  onSelect: (amount: number) => void;
  selectedAmount?: number;
  disabled?: boolean;
}

export function LoanAmountSelector({ onSelect, selectedAmount, disabled }: LoanAmountSelectorProps) {
  return (
    <div className="space-y-3 p-4 bg-card rounded-xl border border-border animate-scale-in">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <IndianRupee className="w-4 h-4 text-primary" />
        <span>Select Loan Amount</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LOAN_AMOUNTS.map((amount) => (
          <Button
            key={amount}
            variant={selectedAmount === amount ? 'default' : 'outline'}
            onClick={() => onSelect(amount)}
            disabled={disabled}
            className={cn(
              'h-auto py-3 flex flex-col gap-0.5 transition-all',
              selectedAmount === amount && 'shadow-glow'
            )}
          >
            <span className="text-lg font-semibold">{formatCurrency(amount)}</span>
            <span className="text-xs opacity-70">Personal Loan</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
