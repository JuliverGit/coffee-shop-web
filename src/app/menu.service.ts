import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class MenuService {

  private apiUrl = 'http://localhost:3000/api/menu';

  constructor(private http: HttpClient) {}

  // ── Get all menu items ──
  getMenuItems(): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(this.apiUrl);
  }

  // ── Get by category ──
  getByCategory(category: string): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}?category=${category}`);
  }
}