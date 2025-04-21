import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function MobileNavigation() {
  const [location] = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      icon: "dashboard",
      path: "/"
    },
    {
      name: "Atividades",
      icon: "assignment",
      path: "/activities"
    },
    {
      name: "Negociações",
      icon: "handshake",
      path: "/negotiations"
    },
    {
      name: "Chat",
      icon: "chat",
      path: "/chat"
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 py-2 md:hidden z-10">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path || (item.path === "/" && location === "/");
          
          return (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex flex-col items-center justify-center px-4 py-1", 
                isActive ? "text-primary" : "text-neutral-300 hover:text-primary"
              )}>
                <span className="material-icons">{item.icon}</span>
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
