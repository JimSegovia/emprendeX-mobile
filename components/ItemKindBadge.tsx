import React from 'react';
import { View, Text } from 'react-native';
import { useAccountPreferences } from '@/lib/account-preferences-context';

type ItemKindBadgeProps = {
  kind: 'Producto' | 'Servicio';
  className?: string;
};

export function ItemKindBadge({ kind, className }: ItemKindBadgeProps) {
  const { palette } = useAccountPreferences();
  const isServicio = kind === 'Servicio';

  return (
    <View
      className={`self-start rounded-full px-2.5 py-1 ${className ?? ''}`}
      style={{
        backgroundColor: isServicio ? '#ecfdf5' : palette.primarySoft,
      }}
    >
      <Text
        className="text-[10px] font-semibold"
        style={{
          color: isServicio ? '#047857' : palette.primaryText,
        }}
      >
        {kind}
      </Text>
    </View>
  );
}
