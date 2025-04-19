import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useGamification } from "@/contexts/GamificationContext";
import { Bell, Menu, Settings, LogOut, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  toggleSidebar: () => void;
}

export function Header({ toggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { profile } = useGamification();
  const [notificationsCount] = useState(3); // Exemplo - isso viria de um contexto real

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
        <Link href={`/${user?.role.toLowerCase()}`} className="flex items-center gap-2">
          <div className="h-8 w-8">
            <img src="/images/logo.svg" alt="BrokerBooster" className="h-full w-full" />
          </div>
          <span className="hidden font-bold text-xl md:inline-block">BrokerBooster</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationsCount > 0 && (
              <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs">
                {notificationsCount}
              </Badge>
            )}
          </Button>
        </div>
        
        {profile && (
          <Link href="/gamification">
            <Button variant="outline" size="sm" className="hidden gap-2 md:flex">
              <Award className="h-4 w-4" />
              <span>Nível {profile.profile.level}</span>
              <Badge variant="secondary" className="ml-1">{profile.profile.totalPoints} pts</Badge>
            </Button>
          </Link>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className={cn(
                  "bg-primary text-primary-foreground",
                  user?.role === "broker" && "bg-blue-500",
                  user?.role === "manager" && "bg-green-500",
                  user?.role === "director" && "bg-purple-500"
                )}>
                  {user?.avatarInitials || user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.username}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/profile" className="flex w-full items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Meu perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/gamification" className="flex w-full items-center">
                  <Award className="mr-2 h-4 w-4" />
                  <span>Gamificação</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
} 