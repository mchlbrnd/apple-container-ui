import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Container,
  HardDrive,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    title: "Containers",
    href: "/",
    icon: Container,
  },
  {
    title: "Images",
    href: "/images",
    icon: HardDrive,
  },
  {
    title: "Registry",
    href: "/registry", 
    icon: Globe,
  },
  {
    title: "System",
    href: "/system",
    icon: Settings,
  },
];

export function AppSidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        "h-full bg-secondary border-r border-border transition-all duration-200 flex flex-col",
        collapsed ? "w-16" : "w-sidebar"
      )}
    >
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-3">
        {!collapsed && (
          <h1 className="text-sm font-medium text-foreground">Container Manager</h1>
        )}
        <Button
          variant="ghost" 
          size="sm"
          onClick={onToggle}
          className="h-6 w-6 p-0 hover:bg-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}