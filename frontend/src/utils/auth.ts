import { UserRole } from '@/types/user';


export const getDefaultRouteForRole = (role: UserRole): string => {
  if (role === 'AD') {
    return '/devices';
  }

  return '/dashboard';
};