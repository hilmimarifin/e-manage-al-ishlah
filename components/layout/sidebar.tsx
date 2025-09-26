"use client";

import Tooltip from "@/components/elements/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLogout, useUserMenus } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useAuthStore } from "@/store/auth-store";
import {
  ChevronDown,
  ChevronLeft,
  Home,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

interface SidebarProps {
  setHeaderTitle: (title: string) => void;
}

export function Sidebar({ setHeaderTitle }: SidebarProps) {
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

  // Auto-expand parent menus if their children are active and set header title
  useEffect(() => {
    const activeMenu = menus.find(
      (menu: { path: string }) => menu.path === pathname
    );
    if (activeMenu) {
      // Set the header title based on the active menu
      setHeaderTitle(activeMenu.name);
      
      // Expand parent menu if this is a child menu
      if (activeMenu.parentId) {
        setExpandedMenus((prev) => new Set(prev).add(activeMenu.parentId || ""));
      }
    }
  }, [pathname, menus, setHeaderTitle]);

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

  const organizedMenus = organizeMenus(menus as Menu[]);

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
          {sidebarOpen ? (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-200 ease-in-out hover:bg-primary-foreground/10",
                !sidebarOpen && "justify-center px-2",
                isChild && "ml-4 w-[calc(100%-1rem)]"
              )}
              onClick={() => {
                sidebarOpen && toggleExpanded(menu.id);
              }}
            >
              <Icon className="h-4 w-4" />
              <>
                <span className="ml-3 flex-1 text-left">{menu.name}</span>
                {hasChildren && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300 ease-in-out",
                      isExpanded && "rotate-180"
                    )}
                  />
                )}
              </>
            </Button>
          ) : (
            <Tooltip content={menu.name} side="right" sideOffset={15}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200 ease-in-out hover:bg-primary-foreground/10",
                  !sidebarOpen && "justify-center px-2",
                  isChild && "ml-4 w-[calc(100%-1rem)]"
                )}
                onClick={() => {
                  sidebarOpen && toggleExpanded(menu.id);
                }}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}

          {/* Render children with smooth animation */}
          {sidebarOpen && isExpanded && hasChildren && (
            <div className="mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300 ease-in-out">
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
          {sidebarOpen ? (
            <Button
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start transition-all duration-200 ease-in-out ",
                isChild && "ml-4 w-[calc(100%-1rem)]"
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="ml-3">{menu.name}</span>
            </Button>
          ) : (
            <Tooltip content={menu.name} side="right" sideOffset={15}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start transition-all duration-200 ease-in-out ",
                  "justify-center px-2",
                  isChild && "ml-4 w-[calc(100%-1rem)]"
                )}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </Tooltip>
          )}
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop with smooth fade */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          "relative flex h-full flex-col text-primary-foreground bg-primary",
          // Smooth transitions with easing
          "transition-all duration-300 ease-in-out transform",
          // Desktop behavior
          "md:relative md:z-auto md:translate-x-0",
          sidebarOpen ? "md:w-64" : "md:w-16",
          // Mobile behavior - overlay with slide animation
          "fixed top-0 left-0 z-50 md:static",
          sidebarOpen
            ? "w-64 translate-x-0"
            : "w-64 -translate-x-full md:w-16 md:translate-x-0",
          // Hide on mobile when closed
          !sidebarOpen && "md:flex"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          {sidebarOpen && (
            <h2 className="text-lg font-semibold">DTA Al-Ishlah</h2>
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

        <ScrollArea className="flex-1 px-2 py-4 text-primary-foreground">
          <nav
            className={cn(
              "space-y-2 transition-all duration-300 ease-in-out",
              sidebarOpen
                ? "opacity-100 translate-x-0"
                : "opacity-90 translate-x-1"
            )}
          >
            {organizedMenus.map((menu) => renderMenuItem(menu))}
          </nav>
        </ScrollArea>
        <Separator />
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full justify-start transition-colors py-8",
            !sidebarOpen && "justify-center px-2"
          )}
        >
          <LogOut color="red" className="h-5 w-5 " />
          {sidebarOpen && (
            <>
              <span className="text-red-500 font-semibold ml-3">Log out</span>
            </>
          )}
        </Button>
      </div>
    </>
  );
}
