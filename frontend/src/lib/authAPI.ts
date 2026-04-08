import { BASE_URL } from '../config/api';
import type { AuthSession } from '../types/AuthSession';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export type BeaconMeResponse = {
    supporterId: number | null;
    displayName: string | null;
    firstName: string | null;
    supporterType: string | null;
};

const emptyBeaconMe: BeaconMeResponse = {
    supporterId: null,
    displayName: null,
    firstName: null,
    supporterType: null,
};

function parseBeaconMePayload(data: unknown): BeaconMeResponse {
    if (typeof data !== 'object' || data === null) {
        return emptyBeaconMe;
    }
    const o = data as Record<string, unknown>;

    const supporterId =
        o.supporterId === null
            ? null
            : typeof o.supporterId === 'number' && Number.isFinite(o.supporterId)
              ? o.supporterId
              : null;

    const displayName =
        o.displayName === null
            ? null
            : typeof o.displayName === 'string'
              ? o.displayName
              : null;

    const firstName =
        o.firstName === null
            ? null
            : typeof o.firstName === 'string'
              ? o.firstName
              : null;

    const supporterType =
        o.supporterType === null
            ? null
            : typeof o.supporterType === 'string'
              ? o.supporterType
              : null;

    return { supporterId, displayName, firstName, supporterType };
}

export async function getBeaconMe(): Promise<BeaconMeResponse> {
    try {
        const response = await fetch(`${BASE_URL}/Me`, {
            credentials: 'include',
        });
        if (!response.ok) {
            return emptyBeaconMe;
        }
        const data: unknown = await response.json();
        return parseBeaconMePayload(data);
    } catch {
        return emptyBeaconMe;
    }
}


async function readApiError(
    response: Response,
    fallbackMessage: string
  ): Promise<string> {
    const contentType = response.headers.get('content-type') ?? '';
  
    if (!contentType.includes('application/json')) {
      return fallbackMessage;
    }
  
    const data = await response.json();
  
    if (typeof data?.detail === 'string' && data.detail.length > 0) {
      return data.detail;
    }
  
    if (typeof data?.title === 'string' && data.title.length > 0) {
      return data.title;
    }
  
    if (data?.errors && typeof data.errors === 'object') {
      const firstError = Object.values(data.errors)
      .flat()
      .find((value): value is string => typeof value === 'string');

    if (firstError) {
      return firstError;
    }
  }

  if (typeof data?.message === 'string' && data.message.length > 0) {
    return data.message;
  }

  return fallbackMessage;
}


export async function getAuthSession(): Promise<AuthSession> {
    const response = await fetch(`${apiBaseUrl}/api/auth/me`,{
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch auth session');
    }
    const data: unknown = await response.json();
    if (typeof data !== 'object' || data === null) {
        throw new Error('Failed to fetch auth session');
    }
    const o = data as Record<string, unknown>;
    const rolesRaw = o.roles;
    const roles =
        Array.isArray(rolesRaw)
            ? rolesRaw.filter((r): r is string => typeof r === 'string')
            : [];

    return {
        isAuthenticated: o.isAuthenticated === true,
        userName:
            o.userName === null
                ? null
                : typeof o.userName === 'string'
                  ? o.userName
                  : null,
        email:
            o.email === null ? null : typeof o.email === 'string' ? o.email : null,
        roles,
        supporterId: null,
        displayName: null,
    };
}

export async function registerUser(
    email: string,
    password: string,
): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password}),
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(
            await readApiError(response, 'Failed to register user')
        );
    }
}

export async function loginUser(email: string, password: string, rememberMe: boolean): Promise<void> {
    const searchParams = new URLSearchParams();
    searchParams.set("useCookies", "true");

    if (rememberMe) {
        searchParams.set('useSessionCookies', 'false');
    }
    else{
        searchParams.set('useSessionCookies', 'true');
    }

    const response = await fetch(`${apiBaseUrl}/api/auth/login?${searchParams.toString()}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        throw new Error(
            await readApiError(response, 'Failed to login user')
        );
    }
}

export async function logoutUser(): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    if (!response.ok) {
        throw new Error(
            await readApiError(response, 'Failed to logout user')
        );
    }
}
