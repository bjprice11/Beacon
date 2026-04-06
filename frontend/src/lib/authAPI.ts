import type { AuthSession } from '../types/AuthSession';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export async function getAuthSession(): Promise<AuthSession> {
    const response = await fetch(`${apiBaseUrl}/api/auth/me`,{
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch auth session');
    }
    return response.json();
}