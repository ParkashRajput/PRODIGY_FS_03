import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all public rooms + rooms user is member of
export const getRooms = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      room_members!inner(user_id)
    `)
    .eq('room_members.user_id', userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ rooms: data });
};

// Create a new room
export const createRoom = async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;
  const userId = req.user!.id;

  if (!name) {
    res.status(400).json({ error: 'Room name is required' });
    return;
  }

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({ name, description, created_by: userId, is_private: false })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Creator auto joins
  await supabase.from('room_members').insert({
    room_id: room.id,
    user_id: userId
  });

  res.status(201).json({ room });
};

// Join a room
export const joinRoom = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.user!.id;

  const { error } = await supabase
    .from('room_members')
    .insert({ room_id: roomId, user_id: userId });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: 'Joined room successfully' });
};

// Get all public rooms (for discovery)
export const getPublicRooms = async (req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('is_private', false)
    .order('created_at', { ascending: true });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ rooms: data });
};

// Get messages for a room
export const getMessages = async (req: AuthRequest, res: Response) => {
  const { roomId } = req.params;
  const userId = req.user!.id;

  // Check if user is member
  const { data: member } = await supabase
    .from('room_members')
    .select('id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .single();

  if (!member) {
    res.status(403).json({ error: 'You are not a member of this room' });
    return;
  }

  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      profiles(name, avatar_color)
    `)
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ messages: data });
};

// Create DM room between two users
export const createDM = async (req: AuthRequest, res: Response) => {
  const { targetUserId } = req.body;
  const userId = req.user!.id;

  if (!targetUserId) {
    res.status(400).json({ error: 'Target user is required' });
    return;
  }

  // Check if DM already exists between these two users
  const { data: existing } = await supabase
    .from('rooms')
    .select(`
      *,
      room_members!inner(user_id)
    `)
    .eq('is_private', true)
    .eq('room_members.user_id', userId);

  if (existing) {
    for (const room of existing) {
      const { data: members } = await supabase
        .from('room_members')
        .select('user_id')
        .eq('room_id', room.id);

      const memberIds = members?.map(m => m.user_id) || [];
      if (memberIds.includes(targetUserId) && memberIds.length === 2) {
        res.status(200).json({ room });
        return;
      }
    }
  }

  // Get target user's name
  const { data: targetProfile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', targetUserId)
    .single();

  // Create new DM room
  const { data: room, error } = await supabase
    .from('rooms')
    .insert({
      name: targetProfile?.name || 'DM',
      is_private: true,
      created_by: userId
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Add both users
  await supabase.from('room_members').insert([
    { room_id: room.id, user_id: userId },
    { room_id: room.id, user_id: targetUserId }
  ]);

  res.status(201).json({ room });
};

// Get all users (for DM)
export const getUsers = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_color, last_seen')
    .neq('id', userId);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ users: data });
};