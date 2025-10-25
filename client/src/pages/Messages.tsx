import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send } from "lucide-react";

export default function Messages() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: matches = [] } = trpc.matches.list.useQuery();
  const { data: messages = [] } = trpc.messages.getConversation.useQuery(
    { matchId: selectedMatchId || 0, limit: 50 },
    { enabled: !!selectedMatchId }
  );
  const sendMessage = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageText("");
      if (selectedMatchId) {
        trpc.useUtils().messages.getConversation.invalidate({ matchId: selectedMatchId });
      }
    },
  });

  if (!user) {
    navigate("/");
    return null;
  }

  const handleSendMessage = () => {
    if (!selectedMatchId || !messageText.trim()) return;
    
    const match = matches.find((m) => m.id === selectedMatchId);
    if (!match) return;

    const receiverId = match.userId1 === user.id ? match.userId2 : match.userId1;
    sendMessage.mutate({
      matchId: selectedMatchId,
      receiverId,
      content: messageText,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-red-600">Messages</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => navigate("/discover")}>
              Discover
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              Profile
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6 h-96">
          {/* Matches List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h2 className="font-bold text-gray-900">Your Matches</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {matches.length === 0 ? (
                <div className="p-4 text-center text-gray-600">
                  No matches yet. Start liking profiles!
                </div>
              ) : (
                matches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatchId(match.id)}
                    className={`w-full p-4 text-left border-b hover:bg-gray-50 transition ${
                      selectedMatchId === match.id ? "bg-red-50" : ""
                    }`}
                  >
                    <p className="font-medium text-gray-900">
                      User {match.userId1 === user.id ? match.userId2 : match.userId1}
                    </p>
                    <p className="text-sm text-gray-600">{match.status}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            {selectedMatchId ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-bold text-gray-900">Chat</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-600">No messages yet. Say hello!</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === user.id
                              ? "bg-red-600 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSendMessage();
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessage.isPending || !messageText.trim()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600">
                Select a match to start chatting
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
