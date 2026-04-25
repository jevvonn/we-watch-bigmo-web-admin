import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import {
  Phone,
  Video,
  MoreHorizontal,
  Send,
  CheckCheck,
  Check,
  Clock,
  Loader2,
  MessageSquare,
} from "lucide-react";
import type { ConversationRoom, UiMessage } from "../types";
import { avatarFor, formatMessageTime } from "../utils";

const QUICK: string[] = [];

interface BubbleProps {
  msg: UiMessage;
  mine: boolean;
  avatar: string;
  showAvatar: boolean;
}

function Bubble({ msg, mine, avatar, showAvatar }: BubbleProps) {
  return (
    <div
      className={`flex mb-1.5 gap-2.5 items-end ${mine ? "justify-end" : "justify-start"}`}
    >
      {!mine &&
        (showAvatar ? (
          <img
            src={avatar}
            className="w-7 h-7 rounded-[10px] shrink-0 mb-1"
            alt=""
          />
        ) : (
          <div className="w-7 shrink-0" />
        ))}
      <div>
        <div
          className={`max-w-[460px] px-3.5 py-2.5 text-sm leading-[1.5] whitespace-pre-wrap break-words rounded-[18px]
            ${
              mine
                ? `bg-bubble-out text-cream rounded-br-md shadow-[0_1px_0_rgba(0,0,0,.05)] ${msg.pending ? "opacity-70" : ""}`
                : "bg-bubble-in text-ink rounded-bl-md border border-line-soft"
            }`}
        >
          {msg.content}
        </div>
        <div
          className={`text-[10.5px] text-muted mt-1 flex items-center gap-1 font-mono
          ${mine ? "justify-end" : "justify-start pl-[38px]"}`}
        >
          <span>{formatMessageTime(msg.createdAt)}</span>

          {mine && (
            <Check size={12} strokeWidth={1.75} className="text-muted-2" />
          )}
        </div>
      </div>
    </div>
  );
}

interface Props {
  room: ConversationRoom | null;
  messages: UiMessage[];
  currentUserId: string;
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  connected: boolean;
  onSend: (text: string) => void;
  onLoadMore: () => void;
}

export function ChatThread({
  room,
  messages,
  currentUserId,
  loading,
  hasMore,
  loadingMore,
  connected,
  onSend,
  onLoadMore,
}: Props) {
  const [draft, setDraft] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Scroll positioning refs
  const prevFirstId = useRef<string | null>(null);
  const prevLastId = useRef<string | null>(null);
  const prevRoomId = useRef<string | null>(null);
  // Saved BEFORE prepend: distance from bottom
  const distFromBottom = useRef<number | null>(null);

  // Reset draft + tracking on room change
  useEffect(() => {
    setDraft("");
  }, [room?.id]);

  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    // Room baru → reset tracking
    if (prevRoomId.current !== room?.id) {
      prevFirstId.current = null;
      prevLastId.current = null;
      distFromBottom.current = null;
      prevRoomId.current = room?.id ?? null;
    }

    if (messages.length === 0) {
      prevFirstId.current = null;
      prevLastId.current = null;
      return;
    }

    const firstId = messages[0].id;
    const lastId = messages[messages.length - 1].id;

    if (prevFirstId.current === null) {
      // Initial fill → bottom
      el.scrollTop = el.scrollHeight;
    } else if (
      firstId !== prevFirstId.current &&
      distFromBottom.current !== null
    ) {
      // Older messages prepended → preserve relative position
      el.scrollTop = el.scrollHeight - distFromBottom.current;
      distFromBottom.current = null;
    } else if (lastId !== prevLastId.current) {
      // New message at bottom → only scroll if user was already near bottom
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (dist < 220) el.scrollTop = el.scrollHeight;
    }

    prevFirstId.current = firstId;
    prevLastId.current = lastId;
  }, [messages, room?.id]);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop < 80 && hasMore && !loadingMore && !loading) {
      // Save anchor BEFORE prepend so layout effect can restore
      distFromBottom.current = el.scrollHeight - el.scrollTop;
      onLoadMore();
    }
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-canvas text-muted gap-3">
        <MessageSquare size={48} strokeWidth={1.25} className="text-muted-2" />
        <p className="text-sm">Select a conversation to start chatting</p>
      </div>
    );
  }

  const dateLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
  const partnerAvatar = avatarFor(room.partner.fullName);

  return (
    <div className="flex-1 flex flex-col bg-canvas min-w-0">
      <header className="px-7 py-4 border-b border-line bg-surface flex items-center gap-3.5">
        <img
          src={partnerAvatar}
          alt={room.partner.fullName}
          className="w-11 h-11 rounded-2xl"
        />
        <div>
          <h2 className="text-base font-bold m-0 leading-tight">
            {room.partner.fullName}
          </h2>
          <div className="text-[12.5px] text-muted mt-0.5 flex items-center gap-2">
            <span
              className={`w-[7px] h-[7px] rounded-full inline-block ${connected ? "bg-ok" : "bg-warn"}`}
            />
            <span>{connected ? "Active now" : "Reconnecting…"}</span>
            <span className="text-muted-2">·</span>
            <span className="font-mono text-[11.5px]">{room.partner.role}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-1.5">
          {[Phone, Video, MoreHorizontal].map((Ic, i) => (
            <button
              key={i}
              className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-ink-2 bg-surface-2 hover:bg-line transition-colors"
            >
              <Ic size={16} strokeWidth={1.75} />
            </button>
          ))}
        </div>
      </header>

      <div
        ref={bodyRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-7 pt-1 pb-3"
      >
        {hasMore && (
          <div className="flex items-center justify-center py-3 text-muted text-[11px] font-mono">
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" />
                Loading older messages…
              </span>
            ) : (
              <span>Scroll up for more</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 my-6 mb-3 text-muted text-[11px] font-mono uppercase tracking-[0.08em]">
          <span className="flex-1 h-px bg-line" />
          <span>Today · {dateLabel}</span>
          <span className="flex-1 h-px bg-line" />
        </div>

        {loading && (
          <div className="text-center text-muted text-[13px] py-10 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Loading messages…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-muted text-[13px] py-10">
            No messages yet. Say hi!
          </div>
        )}

        {messages.map((m, i) => {
          const next = messages[i + 1];
          const mine = m.senderId === currentUserId;
          const showAvatar = !mine && (!next || next.senderId !== m.senderId);
          return (
            <Bubble
              key={m.id}
              msg={m}
              mine={mine}
              avatar={partnerAvatar}
              showAvatar={showAvatar}
            />
          );
        })}
      </div>

      <div className="px-7 pt-3.5 pb-5 border-t border-line bg-surface">
        <div className="flex items-end gap-2.5 bg-canvas border border-line rounded-[22px] py-1.5 pl-[18px] pr-1.5 focus-within:border-sage transition-colors">
          <textarea
            ref={taRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            placeholder={`Reply to ${room.partner.fullName.split(" ")[0]}…`}
            className="flex-1 border-0 outline-none bg-transparent resize-none text-sm leading-snug text-ink py-2.5 max-h-[120px] font-sans placeholder:text-muted"
          />
          <button
            onClick={send}
            disabled={!draft.trim() || !connected}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all
              ${
                draft.trim() && connected
                  ? "bg-sage text-cream cursor-pointer hover:bg-sage-d"
                  : "bg-line text-muted cursor-default"
              }`}
          >
            <Send size={17} strokeWidth={1.75} />
          </button>
        </div>

        <div className="text-[11px] text-muted mt-2 font-mono flex items-center justify-end">
          <span>
            <kbd className="font-mono text-[10.5px] border border-line bg-surface-2 px-1.5 py-px rounded text-ink-2">
              Enter
            </kbd>{" "}
            to send ·{" "}
            <kbd className="font-mono text-[10.5px] border border-line bg-surface-2 px-1.5 py-px rounded text-ink-2">
              Shift+Enter
            </kbd>{" "}
            for newline
          </span>
        </div>
      </div>
    </div>
  );
}
