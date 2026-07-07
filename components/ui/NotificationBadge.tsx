import React from 'react';
import { View, Text } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  max?: number;
  size?: 'small' | 'large';
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  max = 99, 
  size = 'small',
  className = '' 
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count;
  const isSmall = size === 'small';

  return (
    <View 
      className={`absolute bg-red-500 items-center justify-center rounded-full
        ${isSmall ? 'min-w-[16px] h-4 px-1 top-0 right-0 -mr-1 -mt-1' : 'min-w-[20px] h-5 px-1.5 top-0 right-0 -mr-2 -mt-1'} 
        ${className}`}
      style={{ zIndex: 10 }}
    >
      <Text 
        className={`text-white font-bold text-center ${isSmall ? 'text-[10px]' : 'text-xs'}`}
        style={{ lineHeight: isSmall ? 16 : 20 }}
      >
        {displayCount}
      </Text>
    </View>
  );
};
