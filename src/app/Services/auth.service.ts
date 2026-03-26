import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface JwtUser {
  sub: string;
  email: string;
  role: string;
  name: string;
  exp?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

const TOKEN_KEY = 'chaac_token';
const API       = '/api/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // ─── Token ───────────────────────────────────────────────────────────────────

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  // ─── Estado de sesión ────────────────────────────────────────────────────────

  isLoggedIn(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    // Verificar expiración del JWT localmente
    if (user.exp && user.exp * 1000 < Date.now()) {
      this.removeToken();
      return false;
    }
    return true;
  }

  /** Decodifica el payload del JWT sin verificar firma (solo lectura local) */
  getCurrentUser(): JwtUser | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as JwtUser;
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  // ─── API calls ───────────────────────────────────────────────────────────────

  register(name: string, email: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/register`, { name, email, password });
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${API}/verify-email`, { params: { token } });
  }

  verifyEmailByToken(accessToken: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/verify-email-token`, { accessToken });
  }

  resendVerification(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${API}/resend-verification`, { email });
  }

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${API}/login`, { email, password })
      .pipe(tap(res => this.saveToken(res.token)));
  }

  logout(): void {
    this.removeToken();
  }

  getMe(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${API}/me`);
  }

  updateMe(data: { name?: string; email?: string }): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${API}/me`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${API}/me/password`, {
      currentPassword,
      newPassword,
    });
  }

  getDireccion(): Observable<unknown> {
    return this.http.get(`${API}/me/direccion`);
  }

  saveDireccion(direccion: unknown): Observable<unknown> {
    return this.http.put(`${API}/me/direccion`, direccion);
  }
}
