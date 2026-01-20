import { Star, Car, ShieldCheck, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Driver, User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type DriverWithUser = Driver & { user: User };

interface DriverCardProps {
  driver: DriverWithUser;
  onBook: (driver: DriverWithUser) => void;
}

export function DriverCard({ driver, onBook }: DriverCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mobile-card flex flex-col gap-3 group hover:border-primary/30"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="w-12 h-12 rounded-xl border border-border">
            <AvatarImage src={driver.user.profilePhoto || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-xl">
              {driver.user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-foreground">{driver.user.name}</h3>
              {driver.isVerified && (
                <ShieldCheck className="w-4 h-4 text-primary fill-primary/10" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded text-foreground font-medium">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> 4.8
              </span>
              <span className="w-1 h-1 bg-border rounded-full"></span>
              <span>120 Trips</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-primary">₹{driver.hourlyRate}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">per hour</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md">
          <Car className="w-3.5 h-3.5 text-foreground/70" />
          <span className="capitalize">{driver.vehicleType || "Sedan"}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/30 px-2 py-1 rounded-md">
          <MapPin className="w-3.5 h-3.5 text-foreground/70" />
          <span>2.5 km away</span>
        </div>
      </div>

      <button 
        onClick={() => onBook(driver)}
        className="mt-2 w-full py-2.5 rounded-xl bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 active:scale-[0.99] transition-all"
      >
        Book Driver
      </button>
    </motion.div>
  );
}
