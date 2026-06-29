import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';
import NewRoomModal from '../components/NewRoomModal';
import type { Room, Profile } from '../types';
import api from '../api/axios';

const Chat = () => {
  const { logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchUsers();
  }, []);

  // Listen for new rooms created by other users
  useEffect(() => {
    if (!socket) return;

    const onRoomAdded = (room: Room) => {
      setRooms(prev => {
        if (prev.find(r => r.id === room.id)) return prev;
        return [...prev, room];
      });
    };

    socket.on('room_added', onRoomAdded);
    return () => { socket.off('room_added', onRoomAdded); };
  }, [socket]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/api/rooms');
      setRooms(res.data.rooms || []);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/rooms/users/all');
      setUsers(res.data.users || []);
    } catch (err) { console.error(err); }
  };

  // When a room is created, add it to the list and select it
  const handleRoomCreated = (room: Room) => {
    setRooms(prev => {
      if (prev.find(r => r.id === room.id)) return prev;
      return [...prev, room];
    });
    setActiveRoom(room);
  };

  const handleStartDM = async (user: Profile) => {
    try {
      const res = await api.post('/api/rooms/dm', { targetUserId: user.id });
      const room = res.data.room;
      setRooms(prev => {
        if (prev.find(r => r.id === room.id)) return prev;
        return [...prev, room];
      });
      setActiveRoom(room);
      setSidebarOpen(false);
    } catch (err) { console.error(err); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={s.page}>
      <div style={{ ...s.sidebarWrap, ...(sidebarOpen ? s.sidebarVisible : {}) }} 
      className='sidebar-always-show'>
        <Sidebar
          rooms={rooms}
          users={users}
          activeRoomId={activeRoom?.id || null}
          onSelectRoom={(room) => { setActiveRoom(room); setSidebarOpen(false); }}
          onNewRoom={() => setShowNewRoom(true)}
          onStartDM={handleStartDM}
          onLogout={handleLogout}
          mobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      </div>

      <div style={s.chatWrap}>
        <ChatArea
          room={activeRoom}
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      </div>

      {showNewRoom && (
        <NewRoomModal
          onClose={() => setShowNewRoom(false)}
          onCreated={handleRoomCreated}
        />
      )}
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  page: { display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#0b141a', fontFamily: "'Inter','Segoe UI',sans-serif" },
  sidebarWrap: { display: 'none', flexShrink: 0 },
  sidebarVisible: { display: 'flex' },
  chatWrap: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
};

export default Chat;