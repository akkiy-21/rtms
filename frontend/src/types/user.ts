export interface User {
    id: string;
    name: string;
    role: UserRole;
  }
  
  export interface UserFormData {
    id: string;
    name: string;
    role: UserRole;
    password?: string;
  }
  
  export type UserRole = 'SU' | 'AD' | 'CU';