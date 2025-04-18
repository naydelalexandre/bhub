import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  user: {
    name: string;
    initials: string;
    role: string;
  };
  notificationCount: number;
}

export default function DashboardHeader({ title, user, notificationCount }: DashboardHeaderProps) {
  const { logoutMutation } = useAuth();
  const [_, navigate] = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-primary">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" size="icon" className="cursor-pointer text-neutral-300">
              <span className="material-icons">notifications</span>
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-danger text-white rounded-full">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </Button>
          </div>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center cursor-pointer p-0 h-auto"
              >
                <Avatar className="h-8 w-8 bg-primary text-white">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium hidden sm:inline">{user.name}</span>
                <ChevronDown className="text-neutral-300 ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="px-2 py-1.5 text-sm font-medium text-neutral-400 hidden sm:block">
                {user.name}
                <p className="text-xs font-normal text-neutral-300 mt-0.5 capitalize">
                  {user.role === "manager" ? "Gestor" : "Corretor"}
                </p>
              </div>
              <DropdownMenuSeparator className="hidden sm:block" />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-danger focus:text-danger"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
