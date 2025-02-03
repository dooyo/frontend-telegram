import React from 'react';
import { useLimits } from '@/context/LimitsContext';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface LimitsDisplayProps {
  type: 'posts' | 'comments';
  showUpgradeButton?: boolean;
  className?: string;
}

export const LimitsDisplay: React.FC<LimitsDisplayProps> = ({
  type,
  showUpgradeButton = true,
  className = ''
}) => {
  const { limits, isLoading } = useLimits();

  if (isLoading || !limits) {
    return (
      <div className="animate-pulse flex space-x-2 items-center">
        <div className="h-4 bg-muted rounded w-24"></div>
        <div className="h-2 bg-muted rounded w-32"></div>
      </div>
    );
  }

  const limitInfo = limits[type];
  const percentage = (limitInfo.current / limitInfo.max) * 100;

  const handleUpgrade = () => {
    window.open('https://t.me/dooyoappbot', '_blank');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </span>
          {limits.isPremium && (
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {limitInfo.current}/{limitInfo.max}
        </span>
      </div>

      <Progress value={percentage} className="h-2" />

      {showUpgradeButton && !limits.isPremium && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleUpgrade}
          >
            <Crown className="h-4 w-4" />
            Upgrade to Premium
          </Button>
        </div>
      )}

      {limits.isPremium && limits.premiumExpiresAt && (
        <p className="text-xs text-muted-foreground">
          Premium expires:{' '}
          {new Date(limits.premiumExpiresAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
};
