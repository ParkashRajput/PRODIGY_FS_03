import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';

interface AuthSocket extends Socket {
  user?: {
    id: string;
    name: string;
    avatar_color: string;
  };
}

const onlineUsers = new Map<string, string>();

export const initSocket = (io: Server) => {

  io.use(async (socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
        name: string;
        avatar_color: string;
      };
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthSocket) => {
    const user = socket.user!;
    console.log(`✅ ${user.name} connected`);

    onlineUsers.set(user.id, socket.id);

    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', user.id);

    io.emit('user_online', { userId: user.id, name: user.name });
    socket.emit('online_users', Array.from(onlineUsers.keys()));

    // ── Auto join all rooms user is member of ──────────
    // This fixes the "messages not showing" bug
    // User joins all their socket rooms on connect
    // so they receive broadcasts even before clicking a room
    const { data: memberRooms } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', user.id);

    if (memberRooms) {
      for (const { room_id } of memberRooms) {
        socket.join(room_id);
      }
    }

    // ── Join Room ──────────────────────────────────────
    socket.on('join_room', async (roomId: string) => {
      socket.join(roomId);
      console.log(`${user.name} joined room ${roomId}`);

      // Also add to DB if not already a member
      const { data: existing } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (!existing) {
        await supabase
          .from('room_members')
          .insert({ room_id: roomId, user_id: user.id });
      }
    });

    // ── Leave Room ────────────────────────────────────
    socket.on('leave_room', (roomId: string) => {
      socket.leave(roomId);
    });

    // ── Send Message ──────────────────────────────────
    socket.on('send_message', async (data: {
      roomId: string;
      content: string;
      tempId: string;       // 👈 client sends a temp ID for optimistic update
    }) => {
      const { roomId, content, tempId } = data;
      if (!content.trim()) return;

      // Security — verify membership
      const { data: member } = await supabase
        .from('room_members')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        socket.emit('message_error', { tempId, error: 'Not a member' });
        return;
      }

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          content: content.trim()
        })
        .select(`*, profiles(name, avatar_color)`)
        .single();

      if (error || !message) {
        socket.emit('message_error', { tempId, error: 'Failed to save' });
        return;
      }

      // Broadcast to ALL in room including sender
      // Attach tempId so sender can replace optimistic message
      io.to(roomId).emit('new_message', { ...message, tempId });
    });

    // ── Room Created — broadcast to everyone ──────────
    // This fixes "others don't see new rooms"
    socket.on('room_created', (room: object) => {
      // Broadcast to everyone except sender
      socket.broadcast.emit('room_added', room);
      // Join the creator into the socket room immediately
      if ('id' in room) {
        socket.join(room.id as string);
      }
    });

    // ── Typing ────────────────────────────────────────
    socket.on('typing_start', (roomId: string) => {
      socket.to(roomId).emit('user_typing', { userId: user.id, name: user.name });
    });

    socket.on('typing_stop', (roomId: string) => {
      socket.to(roomId).emit('user_stop_typing', { userId: user.id });
    });

    // ── Disconnect ────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`❌ ${user.name} disconnected`);
      onlineUsers.delete(user.id);

      await supabase
        .from('profiles')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', user.id);

      io.emit('user_offline', { userId: user.id });
    });
  });
};