import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ConversationList } from "../components/ConversationList";
import { ChatThread } from "../components/ChatThread";
import { useAuth } from "../context/AuthContext";
import { useChatSocket } from "../lib/useChatSocket";
import { api } from "../lib/api";
import { uuid } from "../utils";
import type { ApiMessage, ConversationRoom, UiMessage } from "../types";

export function Dashboard() {
  const { token, user, logout } = useAuth();

  const [rooms, setRooms] = useState<ConversationRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Track active id in a ref so the WS listener (registered once) always sees latest value
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const { connected, send, subscribe } = useChatSocket(token);

  // 1. Initial fetch: rooms list
  useEffect(() => {
    let cancelled = false;
    setLoadingRooms(true);
    api
      .getRooms()
      .then((data) => {
        if (cancelled) return;
        setRooms(data);
        if (data.length && !activeIdRef.current) setActiveId(data[0].id);
      })
      .catch((err) => {
        console.error("Failed to load rooms", err);
        if (err?.status === 401) logout();
      })
      .finally(() => {
        if (!cancelled) setLoadingRooms(false);
      });
    return () => {
      cancelled = true;
    };
  }, [logout]);

  // 2. On room change: fetch first page of messages
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setHasMore(false);
      setNextCursor(null);
      return;
    }
    let cancelled = false;
    setLoadingMsgs(true);
    setMessages([]);
    api
      .getMessages(activeId)
      .then(({ data, hasMore, nextCursor }) => {
        if (cancelled) return;
        // API returns DESC (newest first) → reverse so oldest is at top, newest at bottom
        setMessages(data.slice().reverse());
        setHasMore(hasMore);
        setNextCursor(nextCursor);
        // Mark conversation as read locally
        setRooms((prev) =>
          prev.map((r) => (r.id === activeId ? { ...r, unreadCount: 0 } : r)),
        );
      })
      .catch((err) => {
        console.error("Failed to load messages", err);
        if (err?.status === 401) logout();
      })
      .finally(() => {
        if (!cancelled) setLoadingMsgs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeId, logout]);

  // 3. Listen for incoming WS messages
  useEffect(() => {
    if (!user) return;
    return subscribe((incoming: ApiMessage) => {
      const isMine = incoming.senderId === user.id;
      const isActive = incoming.roomId === activeIdRef.current;

      // Update room's last message + unread count
      setRooms((prev) => {
        const idx = prev.findIndex((r) => r.id === incoming.roomId);
        if (idx < 0) return prev;
        const room = prev[idx];
        const updated: ConversationRoom = {
          ...room,
          lastMessage: incoming,
          unreadCount: isActive || isMine ? 0 : room.unreadCount + 1,
        };
        // Move to top
        const next = prev.slice();
        next.splice(idx, 1);
        next.unshift(updated);
        return next;
      });

      // If this is the active conversation, push into messages
      if (isActive) {
        setMessages((prev) => {
          // If there's a pending optimistic message from us with same content, replace it
          if (isMine) {
            const pendingIdx = prev.findIndex(
              (m) =>
                m.pending &&
                m.content === incoming.content &&
                m.senderId === incoming.senderId,
            );
            if (pendingIdx >= 0) {
              const next = prev.slice();
              next[pendingIdx] = { ...incoming };
              return next;
            }
          }
          // Dedupe by id
          if (prev.some((m) => m.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      }
    });
  }, [subscribe, user]);

  // 4. Send message — optimistic + via WS
  const handleSend = useCallback(
    (text: string) => {
      if (!activeId || !user) return;
      const clientMessageId = uuid();
      const optimistic: UiMessage = {
        id: `pending-${clientMessageId}`,
        clientMessageId,
        pending: true,
        roomId: activeId,
        senderId: user.id,
        senderRole: user.role,
        content: text,
        readAt: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      const ok = send({
        type: "send_message",
        roomId: activeId,
        content: text,
        clientMessageId,
      });

      if (!ok) {
        // Couldn't send — could mark with error state. For now just remove pending.
        setMessages((prev) =>
          prev.filter((m) => m.clientMessageId !== clientMessageId),
        );
      }
    },
    [activeId, user, send],
  );

  // 5. Load older
  const handleLoadMore = useCallback(async () => {
    if (!activeId || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const {
        data,
        hasMore: more,
        nextCursor: cur,
      } = await api.getMessages(activeId, nextCursor);
      // Older messages come DESC; reverse to get oldest-first, then PREPEND
      setMessages((prev) => [...data.slice().reverse(), ...prev]);
      setHasMore(more);
      setNextCursor(cur);
    } catch (err) {
      console.error("Load more failed", err);
    } finally {
      setLoadingMore(false);
    }
  }, [activeId, nextCursor, loadingMore]);

  if (!user) return null;

  const totalUnread = rooms.reduce((s, r) => s + r.unreadCount, 0);
  const activeRoom = rooms.find((r) => r.id === activeId) ?? null;

  return (
    <div className="flex h-screen min-h-[600px]">
      <Sidebar
        unread={totalUnread}
        user={user}
        connected={connected}
        onLogout={logout}
      />
      <ConversationList
        conversations={rooms}
        activeId={activeId}
        loading={loadingRooms}
        currentUserId={user.id}
        onSelect={setActiveId}
      />
      <ChatThread
        room={activeRoom}
        messages={messages}
        currentUserId={user.id}
        loading={loadingMsgs}
        hasMore={hasMore}
        loadingMore={loadingMore}
        connected={connected}
        onSend={handleSend}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
