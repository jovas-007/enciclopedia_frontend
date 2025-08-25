// src/app/models/user.model.ts
export type UserRole = 'admin' | 'user';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;  // 👈 requerido
}
