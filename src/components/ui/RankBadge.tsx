
"use client"

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getRankTier, getRankColor, RankTier } from '@/lib/services/rankService';
import { Trophy, Crown, Shield, Zap, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankBadgeProps {
  rating: number;
  className?: string;
  showIcon?: boolean;
}

export function RankBadge({ rating, className, showIcon = true }: RankBadgeProps) {
  const tier = getRankTier(rating);
  const colorClass = getRankColor(tier);

  const getIcon = () => {
    switch (tier) {
      case 'Bronze': return <Medal size={12} />;
      case 'Silver': return <Shield size={12} />;
      case 'Gold': return <Zap size={12} />;
      case 'Platinum': return <Star size={12} />;
      case 'Diamond': return <Trophy size={12} />;
      case 'Legend': return <Crown size={12} />;
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-black uppercase tracking-widest text-[10px] py-0.5 px-3 flex items-center gap-1.5", 
        colorClass,
        className
      )}
    >
      {showIcon && getIcon()}
      {tier}
    </Badge>
  );
}
