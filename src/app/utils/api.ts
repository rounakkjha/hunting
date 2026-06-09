import type { UserData, User } from '../App';
import { supabase } from './supabase';

// Set to true to force localStorage-only mode (bypass Supabase)
const FORCE_LOCALSTORAGE = false;

export async function loadFromBackend(user: User | null): Promise<UserData | null> {
  if (FORCE_LOCALSTORAGE || !user) {
    console.log('[API] Force localStorage mode or no user - skipping Supabase load');
    return null;
  }
  try {
    console.log('[API] Loading from Supabase for user:', user.username);
    const { data, error } = await supabase
      .from('user_data')
      .select('data')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('[API] Supabase load error:', error.message, error.code);
      return null;
    }
    if (!data) {
      console.log('[API] No data found in Supabase for user:', user.username);
      return null;
    }
    console.log('[API] Loaded from Supabase successfully');
    return data.data as UserData;
  } catch (err) {
    console.error('[API] Exception loading from Supabase:', err);
    return null;
  }
}

export async function saveToBackend(user: User | null, userData: UserData): Promise<void> {
  if (FORCE_LOCALSTORAGE || !user) {
    console.log('[API] Force localStorage mode or no user - skipping Supabase save');
    return;
  }
  try {
    console.log('[API] Saving to Supabase...', { user: user.username, apps: userData.applications.length });
    const { error } = await supabase
      .from('user_data')
      .upsert(
        { user_id: user.id, data: userData, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
    if (error) {
      console.error('[API] Supabase save error:', error);
    } else {
      console.log('[API] Saved to Supabase successfully');
    }
  } catch (err) {
    console.error('[API] Supabase unavailable:', err);
    // Supabase unavailable — localStorage remains the local fallback
  }
}
