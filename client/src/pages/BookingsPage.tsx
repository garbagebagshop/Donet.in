import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Chat } from "@/components/Chat";

export default function BookingsPage() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useBookings();

  const isDriver = user?.role === "driver";

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-background">
      <Header title={isDriver ? "My Trips" : "Booking Activity"} />
      
      <main className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>
        ) : bookings?.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <div className="text-4xl mb-4">📭</div>
            <p>No booking history found.</p>
          </div>
        ) : (
          bookings?.map((booking) => (
            <Card key={booking.id} className="border-border shadow-sm rounded-2xl overflow-hidden hover:border-primary/20 transition-colors">
              <CardContent className="p-0">
                <div className="p-4 flex justify-between items-start border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        booking.status === "completed" ? "default" :
                        booking.status === "cancelled" ? "destructive" :
                        booking.status === "accepted" ? "outline" : "secondary"
                      }
                      className="capitalize rounded-md"
                    >
                      {booking.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(booking.createdAt || Date.now()), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="font-bold text-sm">
                    ID: #{booking.id.toString().padStart(4, '0')}
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold">
                      {isDriver ? booking.customer.name.charAt(0) : booking.driver.user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">
                        {isDriver ? booking.customer.name : booking.driver.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isDriver ? "Customer" : `${booking.driver.vehicleType} Driver`}
                      </div>
                    </div>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-4 before:w-0.5 before:bg-border before:border-l before:border-dashed">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                      <div className="text-xs font-semibold text-muted-foreground">PICKUP</div>
                      <div className="text-sm">{booking.pickupLocation}</div>
                    </div>
                    {booking.dropLocation && (
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                        <div className="text-xs font-semibold text-muted-foreground">DROP</div>
                        <div className="text-sm">{booking.dropLocation}</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              {/* Chat for active bookings */}
              {["accepted", "started"].includes(booking.status || "") && (
                <div className="p-4 border-t">
                  <h4 className="font-medium mb-2">Chat</h4>
                  <Chat bookingId={booking.id} />
                </div>
              )}
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
