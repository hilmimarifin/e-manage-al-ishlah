import {
  Home,
  LayoutDashboard,
  Users,
  UserCheck,
  Menu as MenuIconLucide,
  LucideProps,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Loader2,
  NotebookPen,
  HardDrive,
  CircleUserRound,
  EyeOff,
  Eye
} from "lucide-react";


export const IconMap = {
  LayoutDashboard,
  Users,
  UserCheck,
  MenuIcon: MenuIconLucide,
  Home,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Loader2,
  NotebookPen,
  HardDrive,
  CircleUserRound,
  EyeOff,
  Eye
};

interface IconsProps extends LucideProps {
  icon: keyof typeof IconMap;
}

export function Icons({ icon, ...props }: IconsProps) {
  const IconComponent = IconMap[icon] || LayoutDashboard;
  return <IconComponent {...props} />;
}
