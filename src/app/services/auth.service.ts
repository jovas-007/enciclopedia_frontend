// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../models/user.model';
export { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  public readonly currentUser$ = new BehaviorSubject<User | null>(null);

  // Ejemplo de login que establece el usuario con rol:
  loginDemoAdmin(): void {
    this.currentUser$.next({
      id: 1,
      name: 'Admin',
      email: 'admin@dbz.dev',
      role: 'admin'
    });
  }

  logout(): void {
    this.currentUser$.next(null);
  }
}
