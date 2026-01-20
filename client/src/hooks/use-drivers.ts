import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDriver } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDrivers(filters?: { vehicleType?: string; citySector?: string }) {
  // Construct URL with query params manually or use URLSearchParams if needed
  // For simplicity, we just pass filters if they exist
  const queryKey = filters 
    ? [api.drivers.list.path, filters] 
    : [api.drivers.list.path];

  return useQuery({
    queryKey,
    queryFn: async () => {
      let url = api.drivers.list.path;
      if (filters) {
        const params = new URLSearchParams();
        if (filters.vehicleType) params.append("vehicleType", filters.vehicleType);
        if (filters.citySector) params.append("citySector", filters.citySector);
        if (params.toString()) url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch drivers");
      return await res.json();
    },
  });
}

export function useDriver(id: number) {
  return useQuery({
    queryKey: [api.drivers.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.drivers.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch driver details");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useUpdateDriverProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertDriver> & { isOnline?: boolean } }) => {
      const url = buildUrl(api.drivers.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.drivers.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Update user profile context
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

// Admin hooks
export function usePendingDrivers() {
  return useQuery({
    queryKey: [api.admin.getPendingDrivers.path],
    queryFn: async () => {
      const res = await fetch(api.admin.getPendingDrivers.path);
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch pending drivers");
      return await res.json();
    },
    retry: false,
  });
}

export function useVerifyDriver() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, isVerified }: { id: number; isVerified: boolean }) => {
      const url = buildUrl(api.admin.verifyDriver.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified }),
      });
      if (!res.ok) throw new Error("Failed to verify driver");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.getPendingDrivers.path] });
      toast({ title: "Success", description: "Driver status updated" });
    },
  });
}
