import { useState } from "react";
import { useChats, useSendMessage } from "@/hooks/use-chats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Send } from "lucide-react";
import { format } from "date-fns";

interface ChatProps {
  bookingId: number;
}

export function Chat({ bookingId }: ChatProps) {
  const [message, setMessage] = useState("");
  const { data: chats, isLoading } = useChats(bookingId);
  const sendMessage = useSendMessage();

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate({
      bookingId,
      message: message.trim(),
    }, {
      onSuccess: () => setMessage(""),
    });
  };

  return (
    <div className="flex flex-col h-96 border rounded-lg">
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : chats?.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {chats?.map((chat) => (
              <div key={chat.id} className="flex gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold">
                  {chat.sender.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{chat.sender.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(chat.timestamp), "HH:mm")}
                    </span>
                  </div>
                  <p className="text-sm bg-secondary/50 rounded-lg p-2">{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend} disabled={sendMessage.isPending}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}