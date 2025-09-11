"use client";

import { useLogout, useUserMenus } from "@/hooks/use-auth";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuthStore } from "@/store/auth-store";

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  UserCheck,
  MenuIcon,
  Home,
};

interface Menu {
  id: string;
  name: string;
  path: string;
  icon: string;
  parentId: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAppStore();
  const { data: menus = [] } = useUserMenus();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Set initial sidebar state based on viewport (only on mount)
  useEffect(() => {
    const isMobile = window.innerWidth < 768; // md breakpoint
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [setSidebarOpen]); // Only run on mount

  // Auto-expand parent menus if their children are active
  useEffect(() => {
    const activeMenu = menus.find((menu: Menu) => menu.path === pathname);
    if (activeMenu?.parentId) {
      setExpandedMenus((prev) => new Set(prev).add(activeMenu.parentId));
    }
  }, [pathname, menus]);

  // Organize menus into parent-child structure
  const organizeMenus = (menus: Menu[]) => {
    const parentMenus = menus
      .filter((menu: Menu) => menu.parentId === null)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return parentMenus.map((parent: Menu) => {
      const children = menus
        .filter((menu: Menu) => menu.parentId === parent.id)
        .sort((a, b) => a.orderIndex - b.orderIndex);

      return {
        ...parent,
        children,
      };
    });
  };

  const organizedMenus = organizeMenus(menus);

  const toggleExpanded = (menuId: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };
  const { user } = useAuthStore();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate();
  };

  const renderMenuItem = (menu: any, isChild = false) => {
    const Icon = iconMap[menu.icon] || LayoutDashboard;
    const isActive = pathname === menu.path;
    const isExpanded = expandedMenus.has(menu.id);
    const hasChildren = menu.children && menu.children.length > 0;

    // For parent menus that should not be clickable (path: "/parent")
    const isParentOnly = menu.path === "#";

    if (isParentOnly && hasChildren) {
      return (
        <div key={menu.id}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start transition-colors",
              !sidebarOpen && "justify-center px-2",
              isChild && "ml-4 w-[calc(100%-1rem)]"
            )}
            onClick={() => sidebarOpen && toggleExpanded(menu.id)}
          >
            <Icon className="h-4 w-4" />
            {sidebarOpen && (
              <>
                <span className="ml-3 flex-1 text-left">{menu.name}</span>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </>
            )}
          </Button>

          {/* Render children */}
          {sidebarOpen && isExpanded && hasChildren && (
            <div className="mt-1 space-y-1">
              {menu.children.map((child: Menu) => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    // Regular menu items (clickable)
    return (
      <div key={menu.id}>
        <Link href={menu.path}>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start transition-colors",
              !sidebarOpen && "justify-center px-2",
              isChild && "ml-4 w-[calc(100%-1rem)]"
            )}
          >
            <Icon className="h-4 w-4" />
            {sidebarOpen && <span className="ml-3">{menu.name}</span>}
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-r bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
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
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !sidebarOpen && "rotate-180"
            )}
          />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="flex items-center space-x-4 ml-2 mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user?.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.role.name}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="space-y-2">
          {organizedMenus.map((menu) => renderMenuItem(menu))}
        </nav>
      </ScrollArea>
      <div
        className="px-4 py-4 border-t-2 flex items-center space-x-2 cursor-pointer hover:bg-red-50 "
        onClick={handleLogout}
      >
        <LogOut color="red" className="h-5 w-5 " />
        <span className="text-red-500 font-semibold">Log out</span>
      </div>
    </div>
  );
}
