import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Boxes,
  User,
} from 'lucide-react-native';

interface TabIconProps {
  color: string;
  size: number;
}

export const DashboardIcon = ({ color, size }: TabIconProps) => (
  <LayoutDashboard color={color} size={size} />
);

export const PartAcceptanceIcon = ({ color, size }: TabIconProps) => (
  <ClipboardCheck color={color} size={size} />
);

export const MaterialFeedingIcon = ({ color, size }: TabIconProps) => (
  <Boxes color={color} size={size} />
);

export const ProfileIcon = ({ color, size }: TabIconProps) => (
  <User color={color} size={size} />
);
