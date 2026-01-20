import { MapPin, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-md z-30 px-4 py-4 border-b border-border/40 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        {title ? (
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              Donet.in
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Location Mock for Customers */}
          {user?.role === "customer" && !title && (
            <div className="flex items-center gap-1 bg-secondary/50 px-3 py-1.5 rounded-full text-xs font-medium text-foreground/80">
              <MapPin className="w-3 h-3 text-primary" />
              <span>Bangalore Central</span>
            </div>
          )}
          
          <button className="relative p-2 rounded-full hover:bg-secondary transition-colors">
            <Bell className="w-5 h-5 text-foreground/70" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
