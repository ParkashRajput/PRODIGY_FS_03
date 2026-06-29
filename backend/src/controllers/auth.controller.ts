import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import jwt from 'jsonwebtoken';

// Random avatar colors for new users
const AVATAR_COLORS = [
  '#25d366', '#128c7e', '#075e54',
  '#34b7f1', '#00a884', '#53bdeb'
];

const randomColor = () =>
  AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  // Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      name,
      avatar_color: randomColor()
    });

  if (profileError) {
    res.status(400).json({ error: profileError.message });
    return;
  }

  // Auto join General room
  const { data: generalRoom } = await supabase
    .from('rooms')
    .select('id')
    .eq('name', 'General')
    .single();

  if (generalRoom) {
    await supabase.from('room_members').insert({
      room_id: generalRoom.id,
      user_id: data.user.id
    });
  }

  res.status(201).json({ message: 'Registered successfully' });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('name, avatar_color')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    res.status(400).json({ error: 'Profile not found' });
    return;
  }

  const token = jwt.sign(
    {
      id: data.user.id,
      email: data.user.email,
      name: profile.name,
      avatar_color: profile.avatar_color
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    message: 'Login successful',
    token,
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile.name,
      avatar_color: profile.avatar_color
    }
  });
};