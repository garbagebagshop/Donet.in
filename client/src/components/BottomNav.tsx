import { Link, useLocation } from "wouter";
import { Search, Briefcase, User, MapPin } from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  if (!user) return null;

  const isDriver = user.role === "driver";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border/60 pb-safe pt-2 px-6 z-40 max-w-md mx-auto">
      <div className="flex justify-around items-center h-16">
        
        {/* Customer: Find Tab */}
        {!isDriver && (
          <NavItem 
            href="/" 
            active={location === "/"} 
            icon={<Search className="w-6 h-6" />} 
            label="Find" 
          />
        )}

        {/* Driver: Jobs Tab */}
        {isDriver && (
          <NavItem 
            href="/" 
            active={location === "/"} 
            icon={<Briefcase className="w-6 h-6" />} 
            label="Jobs" 
          />
        )}

        {/* Common: Bookings/History */}
        <NavItem 
          href="/bookings" 
          active={location === "/bookings"} 
          icon={<MapPin className="w-6 h-6" />} 
          label={isDriver ? "My Trips" : "Activity"} 
        />

        {/* Common: Profile */}
        <NavItem 
          href="/profile" 
          active={location === "/profile"} 
          icon={<User className="w-6 h-6" />} 
          label="Profile" 
        />
        
      </div>
    </nav>
  );
}

function NavItem({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-1 group w-16">
      <div className={clsx(
        "p-1.5 rounded-xl transition-all duration-300",
        active ? "bg-primary/10 text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
      )}>
        {icon}
      </div>
      <span className={clsx(
        "text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </Link>
  );
}
