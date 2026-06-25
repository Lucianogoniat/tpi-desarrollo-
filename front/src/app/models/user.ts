export interface SafeUser {
  id: number;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  createdAt: string;
}

export type UserRole = 'user' | 'admin';

export interface UpdateUserRoleDto {
  role: UserRole;
}
