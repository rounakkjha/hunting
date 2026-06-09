import { supabase } from './supabase';
import type { User } from '../App';

export async function loginUser(username: string, password: string): Promise<User | null> {
  try {
    console.log('[Auth] Attempting login for:', username);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password_hash', password)
      .single();

    if (error || !data) {
      console.error('[Auth] Login failed:', error?.message);
      return null;
    }

    console.log('[Auth] Login successful for:', username);
    return {
      id: data.id,
      username: data.username,
      role: data.role,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('[Auth] Login exception:', err);
    return null;
  }
}

export async function createUser(username: string, password: string, role: 'user' | 'admin' = 'user'): Promise<User | null> {
  try {
    const id = `user_${Date.now()}_${username}`;
    const { data, error } = await supabase
      .from('users')
      .insert({
        id,
        username,
        password_hash: password,
        role,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('[Auth] Create user failed:', error?.message);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      role: data.role,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error('[Auth] Create user exception:', err);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((u: any) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      createdAt: u.created_at,
    }));
  } catch {
    return [];
  }
}

export async function deleteUser(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin' | 'superadmin'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}
