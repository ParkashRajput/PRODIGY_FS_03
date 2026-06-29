import { useState } from 'react';
import { X } from 'lucide-react';
import api from '../api/axios';
import { useSocket } from '../context/SocketContext';

interface Props {
  onClose: () => void;
  onCreated: (room: any) => void;
}

const NewRoomModal = ({ onClose, onCreated }: Props) => {
  const { socket } = useSocket();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    if (!name.trim()) { setError('Room name is required'); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/rooms', {
        name: name.trim(),
        description: description.trim()
      });
      const room = res.data.room;

      // Tell everyone a new room was created
      socket?.emit('room_created', room);

      onCreated(room);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally { setLoading(false); }
  };

  return (
    <div style={s.overlay}>
      <div style={s.modal}>
        <div style={s.header}>
          <h3 style={s.title}>New room</h3>
          <button style={s.close} onClick={onClose}>
            <X size={18} color="#8696a0" />
          </button>
        </div>

        {error && <p style={s.error}>{error}</p>}

        <div style={s.body}>
          <div style={s.field}>
            <label style={s.label}>Room name</label>
            <input style={s.input} placeholder="e.g. Design Team"
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handle()} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Description (optional)</label>
            <input style={s.input} placeholder="What is this room about?"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...s.createBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handle} disabled={loading}>
            {loading ? 'Creating...' : 'Create room'}
          </button>
        </div>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { backgroundColor: '#202c33', borderRadius: 14, width: '100%', maxWidth: 420, overflow: 'hidden', border: '1px solid #2a3942' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #2a3942' },
  title: { color: '#e9edef', fontWeight: 700, fontSize: '1rem', margin: 0 },
  close: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 4 },
  error: { color: '#f15c6d', fontSize: '0.82rem', padding: '0.75rem 1.25rem 0', margin: 0 },
  body: { padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  label: { fontSize: '0.82rem', fontWeight: 600, color: '#8696a0' },
  input: { padding: '0.7rem 0.85rem', borderRadius: 8, border: '1px solid #2a3942', backgroundColor: '#111b21', color: '#e9edef', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  footer: { display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', borderTop: '1px solid #2a3942' },
  cancelBtn: { flex: 1, padding: '0.7rem', border: '1px solid #2a3942', borderRadius: 8, backgroundColor: 'transparent', color: '#8696a0', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' },
  createBtn: { flex: 1, padding: '0.7rem', border: 'none', borderRadius: 8, backgroundColor: '#25d366', color: '#0a0a0a', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' },
};

export default NewRoomModal;