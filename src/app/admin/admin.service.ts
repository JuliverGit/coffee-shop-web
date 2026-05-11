import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';

const API = 'http://localhost:3000/api/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private _users: any[] | null = null;
  private _orders: any[] | null = null;
  private _menuItems: any[] | null = null;
  private _messages: any[] | null = null;

  constructor(private http: HttpClient) {}

  private headers(): HttpHeaders {
    const token = localStorage.getItem('remos_auth_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private authHeader(): HttpHeaders {
    const token = localStorage.getItem('remos_auth_token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ── Stats ──
  getStats(): Observable<any> {
    return this.http.get(`${API}/stats`, { headers: this.headers() });
  }

  // ── Menu ──
  getMenuItems(): Observable<any[]> {
    if (this._menuItems) return of(this._menuItems);
    return this.http.get<any[]>(`${API}/menu`, { headers: this.headers() }).pipe(
      tap(data => this._menuItems = data)
    );
  }

  addMenuItem(formData: FormData): Observable<any> {
    this._menuItems = null;
    return this.http.post(`${API}/menu`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('remos_auth_token') ?? ''}` })
    });
  }

  updateMenuItem(id: number, formData: FormData): Observable<any> {
    this._menuItems = null;
    return this.http.put(`${API}/menu/${id}`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('remos_auth_token') ?? ''}` })
    });
  }

  deleteMenuItem(id: number): Observable<any> {
    this._menuItems = null;
    return this.http.delete(`${API}/menu/${id}`, { headers: this.headers() });
  }

  // ── Orders ──
  getOrders(): Observable<any[]> {
    if (this._orders) return of(this._orders);
    return this.http.get<any[]>(`${API}/orders`, { headers: this.headers() }).pipe(
      tap(data => this._orders = data)
    );
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    this._orders = null;
    return this.http.put(`${API}/orders/${id}/status`, { status }, { headers: this.headers() });
  }

  // ── Users ──
  getUsers(): Observable<any[]> {
    if (this._users) return of(this._users);
    return this.http.get<any[]>(`${API}/users`, { headers: this.headers() }).pipe(
      tap(data => this._users = data)
    );
  }

  banUser(id: number, is_banned: boolean): Observable<any> {
    this._users = null;
    return this.http.put(`${API}/users/${id}/ban`, { is_banned }, { headers: this.headers() });
  }

  deleteUser(id: number): Observable<any> {
    this._users = null;
    return this.http.delete(`${API}/users/${id}`, { headers: this.headers() });
  }

  // ── Messages ──
  getMessages(): Observable<any[]> {
    if (this._messages) return of(this._messages);
    return this.http.get<any[]>(`${API}/messages`, { headers: this.headers() }).pipe(
      tap(data => this._messages = data)
    );
  }

  markAsRead(id: number): Observable<any> {
    this._messages = null;
    return this.http.patch(`${API}/messages/${id}/read`, {}, { headers: this.headers() });
  }

  deleteMessage(id: number): Observable<any> {
    this._messages = null;
    return this.http.delete(`${API}/messages/${id}`, { headers: this.headers() });
  }

  // ── Clear cache ──
  clearCache() {
    this._users = null;
    this._orders = null;
    this._menuItems = null;
    this._messages = null;
  }
}