import { Injectable } from '@angular/core';

export interface StoredUser {
  name: string;
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USERS_KEY = 'chaac_users';
  private readonly SESSION_KEY = 'chaac_session';

  constructor() {
    this.seedDemoUser();
  }

  private seedDemoUser(): void {
    const users = this.getUsers();
    const demoExists = users.some(u => u.email === 'demo@chaac.mx');
    if (!demoExists) {
      users.push({ name: 'Demo', email: 'demo@chaac.mx', password: '1234' });
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  private getUsers(): StoredUser[] {
    try {
      return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  register(name: string, email: string, password: string): boolean {
    const users = this.getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    users.push({ name, email: email.toLowerCase(), password });
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.SESSION_KEY, email.toLowerCase());
    return true;
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      localStorage.setItem(this.SESSION_KEY, user.email);
      return true;
    }
    return false;
  }

  /**
   * Abre sesión después de verificación biométrica exitosa.
   * Solo debe llamarse tras confirmar la identidad con WebAuthnService.login().
   */
  loginBiometric(email: string): boolean {
    const users = this.getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(this.SESSION_KEY, user.email);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.SESSION_KEY);
  }

  getCurrentUser(): StoredUser | null {
    const email = localStorage.getItem(this.SESSION_KEY);
    if (!email) return null;
    return this.getUsers().find(u => u.email === email) || null;
  }
}
