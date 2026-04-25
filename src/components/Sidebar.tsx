import { useState } from "react";
import {
  MessageSquare,
  Users,
  Calendar,
  FileText,
  Activity,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import type { User } from "../types";
import { avatarFor } from "../utils";

interface NavBtnProps {
  Icon: LucideIcon;
  active?: boolean;
  badge?: number;
  label: string;
  onClick?: () => void;
}

function NavBtn({ Icon, active, badge, label, onClick }: NavBtnProps) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all
        ${active ? "bg-canvas text-ink" : "text-cream/70 hover:bg-white/5"}`}
    >
      <Icon size={20} strokeWidth={1.75} />
      {badge ? (
        <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 bg-crit text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-ink">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

const NAV: { id: string; Icon: LucideIcon; label: string }[] = [
  { id: "chat", Icon: MessageSquare, label: "Messages" },
];

interface SidebarProps {
  unread: number;
  user: User;
  connected: boolean;
  onLogout: () => void;
}

export function Sidebar({ unread, user, connected, onLogout }: SidebarProps) {
  const [active, setActive] = useState("chat");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="w-[76px] bg-ink text-cream flex flex-col items-center py-5 gap-1 shrink-0 relative">
      <div className="w-11 h-11 bg-sage rounded-xl flex items-center justify-center mb-4 shadow-[0_2px_0_rgba(0,0,0,.2)_inset]">
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <path
            d="M8 24V8l8 8 8-8v16"
            stroke="#FBF8F2"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {NAV.map((item) => (
        <NavBtn
          key={item.id}
          Icon={item.Icon}
          active={active === item.id}
          badge={item.id === "chat" ? unread : undefined}
          label={item.label}
          onClick={() => setActive(item.id)}
        />
      ))}

      <div className="flex-1" />

      <NavBtn Icon={Settings} label="Settings" />

      <div className="mt-2.5 relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="block relative"
          title={user.fullName}
        >
          <img
            src={avatarFor(user.fullName)}
            alt={user.fullName}
            className="w-10 h-10 rounded-xl border-2 border-white/10"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink ${
              connected ? "bg-ok" : "bg-warn"
            }`}
            title={connected ? "Connected" : "Reconnecting…"}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute bottom-0 left-12 z-20 bg-surface text-ink border border-line rounded-xl shadow-lg w-56 overflow-hidden">
              <div className="px-4 py-3 border-b border-line-soft">
                <div className="font-bold text-sm truncate">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-muted font-mono mt-0.5">
                  @{user.username}
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-canvas text-left text-crit"
              >
                <LogOut size={15} strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
