import { useState } from "react";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useDrivers } from "@/hooks/use-drivers";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Header } from "@/components/Header";
import { DriverCard } from "@/components/DriverCard";
import { Driver, User } from "@shared/schema";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DriverWithUser = Driver & { user: User };

export default function CustomerHome() {
  const [selectedDriver, setSelectedDriver] = useState<DriverWithUser | null>(null);
  const { data: drivers, isLoading } = useDrivers();
  const createBooking = useCreateBooking();
  const { position, getCurrentPosition } = useGeolocation();
  
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");

  const handleBook = async () => {
    if (!selectedDriver || !pickup) return;
    
    // Get current location for pickup coordinates
    await getCurrentPosition();
    
    createBooking.mutate({
      driverId: selectedDriver.id, // This links to driver table
      customerId: 0, // Backend handles this from session
      pickupLocation: pickup,
      dropLocation: drop,
      pickupLat: position?.latitude.toString() || "12.9716", // Fallback to Bangalore coords
      pickupLng: position?.longitude.toString() || "77.5946",
    }, {
      onSuccess: () => setSelectedDriver(null)
    });
  };

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-background relative">
      <Header />
      
      <main className="p-4 space-y-4">
        {/* Hero / Promo Section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-6 text-white shadow-lg shadow-primary/20">
          <h2 className="text-xl font-bold font-display mb-1">Need a driver?</h2>
          <p className="text-white/80 text-sm mb-4">Professional drivers at your doorstep within 30 minutes.</p>
          <div className="flex gap-2">
            <button className="bg-white text-primary text-xs font-bold px-3 py-2 rounded-lg">Book Now</button>
            <button className="bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg backdrop-blur-sm">Schedule Later</button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "SUV", "Sedan", "Luxury", "Verified"].map((filter, i) => (
            <button 
              key={filter} 
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                i === 0 ? "bg-foreground text-background" : "bg-white border border-border text-muted-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Driver List */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h3 className="font-bold text-lg">Nearby Drivers</h3>
            <span className="text-xs text-muted-foreground">Showing {drivers?.length || 0} results</span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : drivers?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No drivers found nearby.
            </div>
          ) : (
            drivers?.map((driver) => (
              <DriverCard 
                key={driver.id} 
                driver={driver} 
                onBook={setSelectedDriver} 
              />
            ))
          )}
        </div>
      </main>

      {/* Booking Bottom Sheet */}
      <Sheet open={!!selectedDriver} onOpenChange={(open) => !open && setSelectedDriver(null)}>
        <SheetContent side="bottom" className="rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>Confirm Booking</SheetTitle>
            <SheetDescription>Verify details before sending request</SheetDescription>
          </SheetHeader>

          {selectedDriver && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                  {selectedDriver.user.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold">{selectedDriver.user.name}</div>
                  <div className="text-xs text-muted-foreground">{selectedDriver.vehicleType} Expert</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-bold text-primary">₹{selectedDriver.hourlyRate}</div>
                  <div className="text-[10px] uppercase">/ hr</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter pickup address" 
                      className="pl-10 h-12 rounded-xl"
                      value={pickup}
                      onChange={(e) => setPickup(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Drop Location (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Enter drop address" 
                      className="pl-10 h-12 rounded-xl"
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 text-yellow-800 text-xs rounded-xl border border-yellow-100 flex gap-2">
                <Clock className="w-4 h-4 shrink-0" />
                <p>Driver usually arrives within 25 minutes. Cancellation fee applies after 5 minutes of booking.</p>
              </div>

              <Button 
                className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary/25" 
                onClick={handleBook}
                disabled={!pickup || createBooking.isPending}
              >
                {createBooking.isPending ? "Sending Request..." : "Confirm Booking Request"}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
