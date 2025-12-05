import { Button } from '@/components/ui/button';
import { Building2, RefreshCw, Menu } from 'lucide-react';

interface HeaderProps {
  onReset?: () => void;
  onMenuToggle?: () => void;
}

export function Header({ onReset, onMenuToggle }: HeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container h-full flex items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuToggle}>
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-foreground leading-none">FinEdge</h1>
              <p className="text-xs text-muted-foreground">AI Loan Assistant</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onReset && (
            <Button variant="outline" size="sm" onClick={onReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              New Application
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
