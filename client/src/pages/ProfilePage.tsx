import { useAuth } from "@/hooks/use-auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { User, Settings, CreditCard, LogOut, Shield } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="pb-24 max-w-md mx-auto min-h-screen bg-background">
      <Header title="Profile" />
      
      <main className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="flex items-center gap-4 py-4">
          <Avatar className="w-20 h-20 border-2 border-primary/20">
            <AvatarImage src={user.profilePhoto || undefined} />
            <AvatarFallback className="text-2xl font-bold bg-secondary text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <div className="text-sm text-muted-foreground capitalize">{user.role} Account</div>
            <div className="text-xs text-muted-foreground mt-1">{user.username}</div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          <MenuButton icon={<User />} label="Personal Details" />
          <MenuButton icon={<Settings />} label="App Settings" />
          <MenuButton icon={<CreditCard />} label="Payment Methods" />
          <MenuButton icon={<Shield />} label="Privacy & Security" />
        </div>

        {/* Logout */}
        <div className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full rounded-xl h-12 gap-2"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
          <div className="text-center text-xs text-muted-foreground mt-4">
            Version 1.0.0 • Donet.in
          </div>
        </div>
      </main>
    </div>
  );
}

function MenuButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 bg-white hover:bg-secondary/50 rounded-xl transition-colors text-left border border-transparent hover:border-border">
      <div className="text-muted-foreground">{icon}</div>
      <span className="font-medium text-foreground">{label}</span>
    </button>
  );
}
