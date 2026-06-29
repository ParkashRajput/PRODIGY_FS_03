export interface User {
  id: string;
  email: string;
  name: string;
  avatar_color: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_color: string;
  last_seen: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_color: string;
  };
}export interface User {
  id: string;
  email: string;
  name: string;
  avatar_color: string;
}

export interface Profile {
  id: string;
  name: string;
  avatar_color: string;
  last_seen: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_color: string;
  };
}