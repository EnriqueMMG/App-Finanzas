import React from 'react';
import {
  ShoppingCart,
  Utensils,
  Home,
  Zap,
  Car,
  Tv,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Dog,
  MoreHorizontal,
  Briefcase,
  Coffee,
  Plane,
  Gift,
  DollarSign,
  CreditCard,
  Smartphone,
  ShieldCheck,
  PiggyBank,
  BookOpen,
  Music,
  Wifi,
  Film,
  Dumbbell,
  Fuel,
  Bus,
  Tag,
  CircleDot,
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { name: 'ShoppingCart', label: 'Supermercado', icon: ShoppingCart },
  { name: 'Utensils', label: 'Restaurante / Comida', icon: Utensils },
  { name: 'Home', label: 'Hogar / Alquiler', icon: Home },
  { name: 'Zap', label: 'Servicios', icon: Zap },
  { name: 'Car', label: 'Auto / Transporte', icon: Car },
  { name: 'Fuel', label: 'Gasolina', icon: Fuel },
  { name: 'Bus', label: 'Transporte Público', icon: Bus },
  { name: 'Tv', label: 'Streaming / TV', icon: Tv },
  { name: 'HeartPulse', label: 'Salud / Farmacia', icon: HeartPulse },
  { name: 'GraduationCap', label: 'Educación', icon: GraduationCap },
  { name: 'ShoppingBag', label: 'Compras / Ropa', icon: ShoppingBag },
  { name: 'Dog', label: 'Mascotas', icon: Dog },
  { name: 'Coffee', label: 'Café / Snacks', icon: Coffee },
  { name: 'Plane', label: 'Viajes / Vacaciones', icon: Plane },
  { name: 'Gift', label: 'Regalos', icon: Gift },
  { name: 'Smartphone', label: 'Celular / Recargas', icon: Smartphone },
  { name: 'Dumbbell', label: 'Gimnasio / Deporte', icon: Dumbbell },
  { name: 'Music', label: 'Música', icon: Music },
  { name: 'PiggyBank', label: 'Ahorro / Inversión', icon: PiggyBank },
  { name: 'MoreHorizontal', label: 'Otros', icon: MoreHorizontal },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Utensils,
  Home,
  Zap,
  Car,
  Fuel,
  Bus,
  Tv,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  Dog,
  MoreHorizontal,
  Briefcase,
  Coffee,
  Plane,
  Gift,
  DollarSign,
  CreditCard,
  Smartphone,
  ShieldCheck,
  PiggyBank,
  BookOpen,
  Music,
  Wifi,
  Film,
  Dumbbell,
  Tag,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = iconMap[name] || CircleDot;
  return <IconComponent className={className} />;
};
