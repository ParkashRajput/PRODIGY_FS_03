import type { Message } from '../types';

interface Props {
  message: Message;
  isOwn: boolean;
  showSender: boolean;
}

const MessageBubble = ({ message, isOwn, showSender }: Props) => {
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div style={{ ...s.wrap, justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      {!isOwn && (
        <div style={{ ...s.avatar, backgroundColor: message.profiles.avatar_color }}>
          {message.profiles.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div style={{ ...s.bubble, backgroundColor: isOwn ? '#005c4b' : '#1f2c34', borderRadius: isOwn ? '10px 2px 10px 10px' : '2px 10px 10px 10px' }}>
        {showSender && !isOwn && (
          <div style={{ ...s.sender, color: message.profiles.avatar_color }}>
            {message.profiles.name}
          </div>
        )}
        <p style={s.text}>{message.content}</p>
        <span style={s.time}>{time}</span>
      </div>
    </div>
  );
};

const s: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', alignItems: 'flex-end', gap: '0.4rem', marginBottom: '0.25rem' },
  avatar: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#0a0a0a', flexShrink: 0 },
  bubble: { maxWidth: '70%', padding: '0.5rem 0.75rem 0.35rem', boxShadow: '0 1px 2px rgba(0,0,0,0.3)' },
  sender: { fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' },
  text: { fontSize: '0.9rem', color: '#e9edef', margin: 0, lineHeight: 1.45, wordBreak: 'break-word' },
  time: { fontSize: '0.68rem', color: '#8696a0', float: 'right', marginLeft: '0.5rem', marginTop: '0.2rem' },
};

export default MessageBubble;