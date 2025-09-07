'use client'

import { useUserMenus } from '@/hooks/use-auth'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Menu as MenuIcon,
  ChevronLeft,
  Home
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  UserCheck,
  MenuIcon,
  Home
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAppStore()
  const { data: menus = [] } = useUserMenus()
  const pathname = usePathname()

  return (
    <div className={cn(
      'relative flex h-full flex-col border-r bg-card transition-all duration-300',
      sidebarOpen ? 'w-64' : 'w-16'
    )}>
      <div className="flex h-16 items-center justify-between border-b px-4">
        {sidebarOpen && (
          <h2 className="text-lg font-semibold">SISTEM INFORMASI</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8"
        >
          <ChevronLeft className={cn(
            'h-4 w-4 transition-transform',
            !sidebarOpen && 'rotate-180'
          )} />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-2">
          {menus.map((menu: any) => {
            const Icon = iconMap[menu.icon] || LayoutDashboard
            const isActive = pathname === menu.path

            return (
              <Link key={menu.id} href={menu.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start transition-colors',
                    !sidebarOpen && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && (
                    <span className="ml-3">{menu.name}</span>
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}