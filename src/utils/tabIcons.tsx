import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  User,
  MapPin,
  Warehouse as WarehouseIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react-native';

interface TabIconProps {
  color: string;
  size: number;
}

export const DashboardIcon = ({ color, size }: TabIconProps) => (
  <LayoutDashboard color={color} size={size} />
);

export const ProfileIcon = ({ color, size }: TabIconProps) => (
  <User color={color} size={size} />
);

export const AreaIcon = ({ color, size }: TabIconProps) => (
  <MapPin color={color} size={size} />
);

export const WarehouseTabIcon = ({ color, size }: TabIconProps) => (
  <WarehouseIcon color={color} size={size} />
);

export const RegisterIcon = ({ color, size }: TabIconProps) => (
  <ClipboardList color={color} size={size} />
);

export const StockInIcon = ({ color, size }: TabIconProps) => (
  <ArrowDownToLine color={color} size={size} />
);

export const StockOutIcon = ({ color, size }: TabIconProps) => (
  <ArrowUpFromLine color={color} size={size} />
);
