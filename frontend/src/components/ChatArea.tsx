import { useState, useEffect, useRef } from 'react';
import { Send, Hash, ArrowLeft, Lock } from 'lucide-react';
import type { Room, Message } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import MessageBubble from './MessageBubble';
import api from '../api/axios';

interface OptimisticMessage extends Message {
  pending?: boolean;
  tempId?: string;
}

interface Props {
  room: Room | null;
  onOpenSidebar: () => void;
}

const ChatArea = ({ room, onOpenSidebar }: Props) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history when room changes
  useEffect(() => {
    if (!room) return;
    setMessages([]);
    setInput('');
    setLoading(true);

    api.get(`/api/rooms/${room.id}/messages`)
      .then(res => setMessages(res.data.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false));

    socket?.emit('join_room', room.id);
    inputRef.current?.focus();
  }, [room?.id]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onMessage = (msg: OptimisticMessage) => {
      setMessages(prev => {
        // Replace optimistic message with real one
        if (msg.tempId) {
          const exists = prev.find(m => m.tempId === msg.tempId);
          if (exists) {
            return prev.map(m => m.tempId === msg.tempId
              ? { ...msg, pending: false }
              : m
            );
          }
        }
        // Avoid duplicate messages
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, { ...msg, pending: false }];
      });
    };

    const onTyping = ({ name, userId }: { name: string; userId: string }) => {
      if (userId !== user?.id) setTyping(name);
    };

    const onStopTyping = ({ userId }: { userId: string }) => {
      if (userId !== user?.id) setTyping(null);
    };

    const onError = ({ tempId }: { tempId: string }) => {
      // Mark failed message
      setMessages(prev => prev.map(m =>
        m.tempId === tempId ? { ...m, pending: false, failed: true } : m
      ));
    };

    socket.on('new_message', onMessage);
    socket.on('user_typing', onTyping);
    socket.on('user_stop_typing', onStopTyping);
    socket.on('message_error', onError);

    return () => {
      socket.off('new_message', onMessage);
      socket.off('user_typing', onTyping);
      socket.off('user_stop_typing', onStopTyping);
      socket.off('message_error', onError);
    };
  }, [socket, user?.id]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (room && socket) {
      socket.emit('typing_start', room.id);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socket.emit('typing_stop', room.id);
      }, 1500);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !room || !socket || !user) return;

    const tempId = `temp_${Date.now()}`;
    const content = input.trim();

    // Optimistic update — show message instantly
    const optimistic: OptimisticMessage = {
      id: tempId,
      tempId,
      room_id: room.id,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      pending: true,
      profiles: {
        name: user.name,
        avatar_color: user.avatar_color
      }
    };

    setMessages(prev => [...prev, optimistic]);
    setInput('');
    inputRef.current?.focus();

    // Stop typing indicator
    socket.emit('typing_stop', room.id);

    // Send to server with tempId
    socket.emit('send_message', { roomId: room.id, content, tempId });
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!room) {
    return (
      <div style={s.empty}>
        <button style={s.menuBtn} onClick={onOpenSidebar}>
          <ArrowLeft size={20} color="#8696a0" />
        </button>
        <div style={s.emptyInner}>
          <div style={s.emptyIcon}>
            <Hash size={32} color="#2a3942" />
          </div>
          <h3 style={s.emptyTitle}>Select a room to start chatting</h3>
          <p style={s.emptySub}>Choose from rooms or start a direct message</p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <button style={s.backBtn} onClick={onOpenSidebar}>
            <ArrowLeft size={18} color="#8696a0" />
          </button>
          <div style={s.roomIcon}>
            {room.is_private
              ? <Lock size={16} color="#8696a0" />
              : <Hash size={16} color="#8696a0" />}
          </div>
          <div>
            <div style={s.roomName}>{room.name}</div>
            {room.description && <div style={s.roomSub}>{room.description}</div>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={s.messages}>
        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.spinner} />
          </div>
        ) : messages.length === 0 ? (
          <div style={s.noMessages}>No messages yet. Say something!</div>
        ) : (
          messages.map((msg, i) => (
            <div key={msg.tempId || msg.id} style={{ opacity: msg.pending ? 0.6 : 1, transition: 'opacity 0.15s' }}>
              <MessageBubble
                message={msg}
                isOwn={msg.sender_id === user?.id}
                showSender={i === 0 || messages[i - 1].sender_id !== msg.sender_id}
              />
            </div>
          ))
        )}

        {typing && (
          <div style={s.typingRow}>
            <div style={s.typingBubble}>
              <span style={s.typingText}>{typing} is typing</span>
              <div style={s.dots}>
                <span style={s.dot} />
                <span style={{ ...s.dot, animationDelay: '0.2s' }} />
                <span style={{ ...s.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={s.inputRow}>
        <div style={s.inputWrap}>
          <input
            ref={inputRef}
            style={s.input}
            placeholder="Type a message"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
          />
        </div>
        <button
          style={{ ...s.sendBtn, opacity: input.trim() ? 1 : 0.5 }}
          onClick={sendMessage}
          disabled={!input.trim()}
        >
          <Send size={18} color="#0a0a0a" />
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrap: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0b141a', height: '100vh', overflow: 'hidden', fontFamily: "'Inter','Segoe UI',sans-serif" },
  empty: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0b141a', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  menuBtn: { position: 'absolute', top: '1rem', left: '1rem', background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8 },
  emptyInner: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem' },
  emptyIcon: { width: 72, height: 72, borderRadius: '50%', backgroundColor: '#111b21', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' },
  emptyTitle: { color: '#e9edef', fontWeight: 700, fontSize: '1.1rem', margin: 0, textAlign: 'center' },
  emptySub: { color: '#8696a0', fontSize: '0.875rem', margin: 0, textAlign: 'center' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', backgroundColor: '#202c33', borderBottom: '1px solid #2a3942', flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  roomIcon: { width: 38, height: 38, borderRadius: '50%', backgroundColor: '#2a3942', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  roomName: { fontWeight: 700, fontSize: '0.95rem', color: '#e9edef' },
  roomSub: { fontSize: '0.75rem', color: '#8696a0' },
  messages: { flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.1rem' },
  loadingWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
  spinner: { width: 28, height: 28, border: '3px solid #2a3942', borderTop: '3px solid #25d366', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  noMessages: { textAlign: 'center', color: '#8696a0', fontSize: '0.875rem', marginTop: '2rem' },
  typingRow: { display: 'flex', justifyContent: 'flex-start', marginTop: '0.25rem' },
  typingBubble: { backgroundColor: '#1f2c34', borderRadius: '2px 10px 10px 10px', padding: '0.5rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  typingText: { fontSize: '0.78rem', color: '#8696a0' },
  dots: { display: 'flex', gap: 3, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8696a0', display: 'inline-block', animation: 'bounce 1.4s infinite ease-in-out' },
  inputRow: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#202c33', borderTop: '1px solid #2a3942', flexShrink: 0 },
  inputWrap: { flex: 1 },
  input: { width: '100%', padding: '0.75rem 1rem', borderRadius: 24, border: 'none', backgroundColor: '#2a3942', color: '#e9edef', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' },
  sendBtn: { width: 42, height: 42, borderRadius: '50%', backgroundColor: '#25d366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s' },
};

export default ChatArea;