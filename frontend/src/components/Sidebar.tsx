import { useState } from 'react';
import { MessageSquare, Plus, Hash, Lock, LogOut, Search, Users } from 'lucide-react';
import type { Room, Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Props {
  rooms: Room[];
  users: Profile[];
  activeRoomId: string | null;
  onSelectRoom: (room: Room) => void;
  onNewRoom: () => void;
  onStartDM: (user: Profile) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const Sidebar = ({ rooms, users, activeRoomId, onSelectRoom, onNewRoom, onStartDM, onLogout, mobileOpen, onCloseMobile }: Props) => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const [tab, setTab] = useState<'rooms' | 'people'>('rooms');
  const [search, setSearch] = useState('');

  const filteredRooms = rooms.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={s.mobileOverlay} onClick={onCloseMobile} />
      )}

      <div style={{ ...s.sidebar, ...(mobileOpen ? s.sidebarOpen : {}) }}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={{ ...s.avatar, backgroundColor: user?.avatar_color || '#25d366' }}>
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <span style={s.userName}>{user?.name}</span>
          </div>
          <div style={s.headerActions}>
            <button style={s.iconBtn} onClick={onNewRoom} title="New room">
              <Plus size={18} color="#8696a0" />
            </button>
            <button style={s.iconBtn} onClick={onLogout} title="Sign out">
              <LogOut size={18} color="#8696a0" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={s.searchWrap}>
          <Search size={14} color="#8696a0" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input style={s.searchInput} placeholder="Search"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Tabs */}
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(tab === 'rooms' ? s.tabActive : {}) }}
            onClick={() => setTab('rooms')}>
            <Hash size={14} />
            Rooms
          </button>
          <button style={{ ...s.tab, ...(tab === 'people' ? s.tabActive : {}) }}
            onClick={() => setTab('people')}>
            <Users size={14} />
            People
          </button>
        </div>

        {/* List */}
        <div style={s.list}>
          {tab === 'rooms' ? (
            filteredRooms.length === 0 ? (
              <div style={s.empty}>No rooms found</div>
            ) : filteredRooms.map(room => (
              <button key={room.id} style={{ ...s.item, ...(activeRoomId === room.id ? s.itemActive : {}) }}
                onClick={() => { onSelectRoom(room); onCloseMobile(); }}>
                <div style={s.itemIcon}>
                  {room.is_private ? <Lock size={16} color="#8696a0" /> : <Hash size={16} color="#8696a0" />}
                </div>
                <div style={s.itemInfo}>
                  <span style={s.itemName}>{room.name}</span>
                  {room.description && <span style={s.itemSub}>{room.description}</span>}
                </div>
              </button>
            ))
          ) : (
            filteredUsers.length === 0 ? (
              <div style={s.empty}>No users found</div>
            ) : filteredUsers.map(u => (
              <button key={u.id} style={s.item} onClick={() => { onStartDM(u); onCloseMobile(); }}>
                <div style={{ ...s.userAvatar, backgroundColor: u.avatar_color }}>
                  {u.name.charAt(0).toUpperCase()}
                  <span style={{ ...s.onlineDot, backgroundColor: onlineUsers.includes(u.id) ? '#25d366' : '#8696a0' }} />
                </div>
                <div style={s.itemInfo}>
                  <span style={s.itemName}>{u.name}</span>
                  <span style={{ ...s.itemSub, color: onlineUsers.includes(u.id) ? '#25d366' : '#8696a0' }}>
                    {onlineUsers.includes(u.id) ? 'Online' : 'Offline'}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Brand */}
        <div style={s.footer}>
          <MessageSquare size={14} color="#2a3942" />
          <span style={s.footerText}>ChatApp</span>
        </div>
      </div>
    </>
  );
};

const s: Record<string, React.CSSProperties> = {
  mobileOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 19 },
  sidebar: { width: 320, minWidth: 320, height: '100vh', backgroundColor: '#111b21', borderRight: '1px solid #2a3942', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 20, transition: 'transform 0.25s ease', fontFamily: "'Inter','Segoe UI',sans-serif" },
  sidebarOpen: { position: 'fixed', left: 0, top: 0, transform: 'translateX(0)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#202c33', borderBottom: '1px solid #2a3942' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.65rem' },
  avatar: { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#0a0a0a', flexShrink: 0 },
  userName: { fontWeight: 600, fontSize: '0.9rem', color: '#e9edef' },
  headerActions: { display: 'flex', gap: '0.25rem' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: 6, display: 'flex', alignItems: 'center' },
  searchWrap: { position: 'relative', padding: '0.6rem 0.75rem', backgroundColor: '#111b21' },
  searchInput: { width: '100%', padding: '0.55rem 0.75rem 0.55rem 2.25rem', borderRadius: 8, border: 'none', backgroundColor: '#202c33', color: '#e9edef', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' },
  tabs: { display: 'flex', borderBottom: '1px solid #2a3942' },
  tab: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem', background: 'none', border: 'none', color: '#8696a0', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', borderBottom: '2px solid transparent' },
  tabActive: { color: '#25d366', borderBottom: '2px solid #25d366' },
  list: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
  item: { width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.7rem 1rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid #1a2830' },
  itemActive: { backgroundColor: '#2a3942' },
  itemIcon: { width: 40, height: 40, borderRadius: '50%', backgroundColor: '#2a3942', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemInfo: { display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 },
  itemName: { fontSize: '0.9rem', fontWeight: 600, color: '#e9edef', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  itemSub: { fontSize: '0.78rem', color: '#8696a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userAvatar: { width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', color: '#0a0a0a', flexShrink: 0, position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', border: '2px solid #111b21' },
  empty: { padding: '2rem 1rem', textAlign: 'center', color: '#8696a0', fontSize: '0.875rem' },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.75rem', borderTop: '1px solid #2a3942' },
  footerText: { fontSize: '0.75rem', color: '#2a3942', fontWeight: 600 },
};

export default Sidebar;