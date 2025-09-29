import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface JwtPayload {
  sub: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': 'Reader' | 'Admin' | 'Unknown';
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
  roleId: string;
  exp: number;
}

export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = cookies();
  
  // Try to get token from cookies first
  let token = (await cookieStore).get('authToken')?.value;
  
  // If not in cookies, try to get from localStorage via a separate endpoint
  // This is a workaround since we can't access localStorage in server components
  if (!token) {
    return null;
  }
  
  return token;
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = parseJwtPayload(token);
    if (!payload) return true;
    
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

export async function requireAuth(requiredRole?: 'Admin' | 'Reader') {
  const token = await getServerAuthToken();
  
  if (!token || isTokenExpired(token)) {
    redirect('/login');
  }
  
  if (requiredRole) {
    const payload = parseJwtPayload(token);
    if (!payload) {
      redirect('/login');
    }
    
    const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (userRole !== requiredRole) {
      redirect('/unauthorized');
    }
  }
  
  return token;
}