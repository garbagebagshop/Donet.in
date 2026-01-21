import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertChat } from "@shared/routes";

export function useChats(bookingId: number) {
  return useQuery({
    queryKey: ["chats", bookingId],
    queryFn: async () => {
      const res = await fetch(`${api.chats.list.path}?bookingId=${bookingId}`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      return await res.json();
    },
    enabled: !!bookingId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertChat) => {
      const res = await fetch(api.chats.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["chats", data.bookingId] });
    },
  });
}