import { useAuth } from "@/hooks/use-auth";
import { usePendingDrivers, useVerifyDriver } from "@/hooks/use-drivers";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: pendingDrivers, isLoading } = usePendingDrivers();
  const verifyDriver = useVerifyDriver();

  // Simple hardcoded check for admin
  // In real app, middleware handles this. 
  // Here we just redirect if not the specific user (though username is string in this schema, user.id is simpler check if we knew it)
  // For demo, we rely on the component rendering. 
  // If API returns 401, query fails.

  const handleVerify = (id: number, isVerified: boolean) => {
    verifyDriver.mutate({ id, isVerified });
  };

  return (
    <div className="min-h-screen bg-slate-50 max-w-3xl mx-auto">
      <div className="bg-slate-900 text-white p-6 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl">Admin Portal</h1>
          <div className="text-xs bg-slate-800 px-3 py-1 rounded-full">Super Admin</div>
        </div>
      </div>

      <main className="p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          Pending Verifications
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">
            {pendingDrivers?.length || 0}
          </span>
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
        ) : pendingDrivers?.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-muted-foreground shadow-sm">
            No pending verifications. Good job!
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingDrivers?.map(driver => (
              <Card key={driver.id} className="overflow-hidden border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{driver.user.name}</h3>
                      <div className="text-sm text-muted-foreground">Mobile: {driver.user.username}</div>
                      <div className="text-sm text-muted-foreground">Type: {driver.vehicleType || "Not specified"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">ID: {driver.id}</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-blue-600 underline cursor-pointer hover:text-blue-800">
                      <FileText className="w-4 h-4" /> License Document
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 underline cursor-pointer hover:text-blue-800">
                      <FileText className="w-4 h-4" /> Aadhaar Card
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleVerify(driver.id, true)}
                      disabled={verifyDriver.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleVerify(driver.id, false)}
                      disabled={verifyDriver.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
