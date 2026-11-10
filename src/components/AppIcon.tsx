import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AppIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const MCI_NAMES = new Set([
  'motorbike',
  'moped',
  'moped-outline',
  'scooter',
  'bike-fast',
  'motorcycle',
]);

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 20,
  color = '#1A1A1A',
  style,
}) => {
  if (!name) {
    return <Ionicons name="pricetag-outline" size={size} color={color} style={style} />;
  }

  if (name.startsWith('mci:') || MCI_NAMES.has(name)) {
    const cleanName = (name.startsWith('mci:') ? name.substring(4) : name) as any;
    return (
      <MaterialCommunityIcons
        name={cleanName}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return <Ionicons name={name as any} size={size} color={color} style={style} />;
};
