export interface User {
    id: string;
    name: string;
    role: UserRole;
    password_change_required: boolean;
  }
  
  export interface UserFormData {
    id: string;
    name: string;
    role: UserRole;
  }

  export interface UserCreateResult {
    user: User;
    temporary_password: string;
  }

  export interface LoginRequestData {
    user_id: string;
    password: string;
  }

  export interface LoginResponseData {
    access_token: string;
    token_type: string;
    user: User;
  }

  export interface ChangePasswordFormData {
    current_password: string;
    new_password: string;
  }
  
  export type UserRole = 'AD' | 'CU';