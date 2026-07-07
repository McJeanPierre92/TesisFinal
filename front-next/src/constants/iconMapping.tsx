import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  ChartSplineIcon,
  ClipboardCheck,
  ClipboardList,
  Eye,
  Filter,
  FlaskConical,
  GraduationCap,
  House,
  LayoutDashboard,
  Layers,
  Network,
  Package,
  PackageSearch,
  UserCog,
  Users,
  UsersRound
} from 'lucide-react'

export const iconMapping = {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  Eye,
  Filter,
  FlaskConical,
  GraduationCap,
  House,
  LayoutDashboard,
  Layers,
  Network,
  PackageSearch,
  ChartSplineIcon,
  UserCog,
  Users,
  UsersRound
}

type DynamicIconProps = {
  iconName: string
  size: number
  className: string
}

export const DynamicIcon = ({
  iconName,
  size = 20,
  className = ''
}: Partial<DynamicIconProps>) => {
  const IconComponent = (iconMapping as Record<string, React.ElementType>)[
    iconName ?? ''
  ]

  if (!IconComponent) {
    return <Package size={size} className={className} />
  }

  return <IconComponent size={size} className={className} />
}
