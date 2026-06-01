import type { UserData } from '../App';

const API_BASE = 'http://localhost:3001/api';

export async function loadFromBackend(userId: string): Promise<UserData | null> {
  try {
    const res = await fetch(`${API_BASE}/data/${userId}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveToBackend(userId: string, data: UserData): Promise<void> {
  try {
    await fetch(`${API_BASE}/data/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    // backend unavailable — localStorage remains the local fallback
  }
}
