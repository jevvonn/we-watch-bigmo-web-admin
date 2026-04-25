export type Role = "USER" | "NURSE" | "ADMIN";

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  fullName: string;
  role: Role;
}

export interface ApiMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderRole: Role;
  content: string;
  readAt: string | null;
  createdAt: string;
}

export interface ConversationRoom {
  id: string;
  partner: Partner;
  lastMessage: ApiMessage | null;
  unreadCount: number;
}

export interface MessagesPage {
  data: ApiMessage[];
  hasMore: boolean;
  nextCursor: string | null;
}

/** Message dengan flag lokal untuk optimistic UI. */
export interface UiMessage extends ApiMessage {
  pending?: boolean;
  clientMessageId?: string;
}

/** WebSocket payload yang masuk. */
export type WsIncoming = { type: "message"; message: ApiMessage };

/** WebSocket payload untuk kirim. */
export interface WsSendMessage {
  type: "send_message";
  roomId: string;
  content: string;
  clientMessageId: string;
}
