import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:3000/api/auth';
  private TOKEN_KEY = 'remos_auth_token';

  // ── Reactive auth state ──
  private _user = signal<User | null>(null);

  readonly currentUser  = this._user.asReadonly();
  readonly isLoggedIn   = computed(() => this._user() !== null);
  readonly displayName  = computed(() => this._user()?.name ?? '');

  constructor(private http: HttpClient) {}

  // ── Login ──
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, payload).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this._user.set(res.user);
      })
    );
  }

  // ── Register ──
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, payload).pipe(
      tap(res => {
        localStorage.setItem(this.TOKEN_KEY, res.token);
        this._user.set(res.user);
      })
    );
  }

  // ── Logout ──
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._user.set(null);
  }

  // ── Restore session ──
  restoreSession() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return;
    this.http.get<User>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: user => this._user.set(user),
      error: ()  => this.logout()
    });
  }

  // ── Get token ──
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}