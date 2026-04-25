import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import type { ConversationRoom } from "../types";
import { avatarFor, formatMessageTime } from "../utils";

interface Props {
  conversations: ConversationRoom[];
  activeId: string | null;
  loading: boolean;
  currentUserId: string;
  onSelect: (id: string) => void;
}

export function ConversationList({
  conversations,
  activeId,
  loading,
  currentUserId,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = conversations.filter((c) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return c.partner.fullName.toLowerCase().includes(q);
  });

  return (
    <div className="w-[340px] bg-surface border-r border-line flex flex-col shrink-0">
      <div className="px-[22px] pt-[22px] pb-3.5">
        <h1 className="text-[22px] font-extrabold tracking-tight m-0 mb-1">
          Conversations
        </h1>
        <p className="text-muted text-[13px] m-0 mb-4">
          {loading
            ? "Loading…"
            : `${conversations.length} ${conversations.length === 1 ? "chat" : "chats"}`}
        </p>

        <div className="flex items-center gap-2 bg-surface-2 border border-line rounded-full px-3.5 py-2 text-muted">
          <Search size={15} strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name"
            className="flex-1 border-0 outline-none bg-transparent text-[13.5px] text-ink placeholder:text-muted"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1 border-t border-line-soft">
        {loading && (
          <div className="flex items-center justify-center gap-2 p-7 text-muted text-[13px]">
            <Loader2 size={14} className="animate-spin" />
            Fetching conversations…
          </div>
        )}

        {!loading &&
          filtered.map((c) => {
            const isActive = c.id === activeId;
            const isMine = c.lastMessage?.senderId === currentUserId;
            const previewText = c.lastMessage?.content ?? "No messages yet";
            const preview = c.lastMessage
              ? isMine
                ? `You: ${previewText}`
                : previewText
              : previewText;
            const time = c.lastMessage
              ? formatMessageTime(c.lastMessage.createdAt)
              : "";

            return (
              <div
                key={c.id}
                onClick={() => onSelect(c.id)}
                className={`flex gap-3 px-[18px] py-3.5 cursor-pointer transition-colors border-l-[3px]
                ${isActive ? "bg-canvas border-sage" : "border-transparent hover:bg-canvas/50"}`}
              >
                <img
                  src={avatarFor(c.partner.fullName)}
                  alt={c.partner.fullName}
                  className="w-11 h-11 rounded-2xl shrink-0 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-sm text-ink truncate">
                      {c.partner.fullName}
                    </span>
                    <span className="text-[11px] text-muted shrink-0 font-mono">
                      {time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2 mt-1">
                    <div
                      className={`text-[12.5px] truncate ${c.lastMessage ? "text-muted" : "text-muted-2 italic"}`}
                    >
                      {preview}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1.5 bg-sage text-white rounded-full text-[10.5px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

        {!loading && filtered.length === 0 && (
          <div className="p-7 text-center text-muted text-[13px]">
            {conversations.length === 0
              ? "No conversations yet."
              : "No matches."}
          </div>
        )}
      </div>
    </div>
  );
}
