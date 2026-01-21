import { useAuth } from "@/hooks/use-auth";
import { useUpdateDriverProfile } from "@/hooks/use-drivers";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Header } from "@/components/Header";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, User, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function DriverDashboard() {
  const { user } = useAuth();
  const updateProfile = useUpdateDriverProfile();
  const { data: bookings, isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const { position, getCurrentPosition } = useGeolocation();
  
  // Safe access to driver profile properties
  const driverProfile = user?.driverProfile;
  const isOnline = driverProfile?.isOnline ?? false;
  const isVerified = driverProfile?.isVerified ?? false;

  const toggleOnline = async () => {
    if (!driverProfile) return;
    
    let updateData: any = { isOnline: !isOnline };
    
    // If going online, get current location
    if (!isOnline) {
      await getCurrentPosition();
      if (position) {
        updateData.currentLat = position.latitude.toString();
        updateData.currentLng = position.longitude.toString();
      }
    }
    
    updateProfile.mutate({
      id: driverProfile.id,
      data: updateData
    });
  };

  const pendingRequests = bookings?.filter(b => b.status === "pending") || [];
  const activeBookings = bookings?.filter(b => ["accepted", "started"].includes(b.status || "")) || [];

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Profile Under Review</h2>
        <p className="text-muted-foreground mb-6">
          Your documents are being verified by our admin team. This usually takes 24 hours.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>Check Status</Button>
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-secondary/30">
      <Header title="Driver Dashboard" />
      
      <main className="p-4 space-y-6">
        {/* Status Card */}
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className={`h-2 w-full ${isOnline ? "bg-green-500" : "bg-zinc-300"}`} />
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <div className="font-bold text-lg">{isOnline ? "You are Online" : "You are Offline"}</div>
              <div className="text-xs text-muted-foreground">
                {isOnline ? "Receiving job requests" : "Go online to start earning"}
              </div>
            </div>
            <Switch checked={isOnline} onCheckedChange={toggleOnline} disabled={updateProfile.isPending} />
          </CardContent>
        </Card>

        {/* Subscription Notice (Visual) */}
        {driverProfile?.subscriptionStatus !== "active" && (
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center justify-between">
            <div className="text-sm font-medium text-primary-foreground/90 text-primary">
              Subscription Inactive
            </div>
            <Button size="sm" className="h-8 text-xs bg-primary text-white">Pay ₹100</Button>
          </div>
        )}

        {/* Requests Section */}
        <div>
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            New Requests
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="rounded-full px-2">{pendingRequests.length}</Badge>
            )}
          </h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-border text-muted-foreground text-sm">
                No new requests. Stay online!
              </div>
            ) : (
              pendingRequests.map(booking => (
                <Card key={booking.id} className="border-border shadow-sm rounded-2xl overflow-hidden">
                  <div className="bg-primary/5 p-3 border-b border-primary/10 flex justify-between items-center">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">New Job</span>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-muted-foreground">
                        {booking.customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold">{booking.customer.name}</div>
                        <div className="text-xs text-muted-foreground">Rating: 4.9 ★</div>
                      </div>
                      <div className="ml-auto font-bold text-lg">₹{driverProfile?.hourlyRate}<span className="text-xs font-normal text-muted-foreground">/hr</span></div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                        <div>
                          <div className="font-medium text-xs text-muted-foreground">PICKUP</div>
                          <div>{booking.pickupLocation}</div>
                        </div>
                      </div>
                      {booking.dropLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                          <div>
                            <div className="font-medium text-xs text-muted-foreground">DROP</div>
                            <div>{booking.dropLocation}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button 
                        variant="outline" 
                        className="rounded-xl border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "rejected" })}
                      >
                        Reject
                      </Button>
                      <Button 
                        className="rounded-xl bg-primary hover:bg-primary/90"
                        onClick={() => updateStatus.mutate({ id: booking.id, status: "accepted" })}
                      >
                        Accept Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
