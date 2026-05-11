import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderPayload {
  items: { menuItemId: number; quantity: number; price: number }[];
  totalAmount: number;
}

export interface OrderResponse {
  orderId: string;
  status: string;
  estimatedTime: number;
}

export interface UserOrder {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: { name: string; quantity: number; price: number }[];
}

@Injectable({ providedIn: 'root' })
export class CartService {

  private apiUrl = 'http://localhost:3000/api/orders';

  private _items = signal<CartItem[]>([]);

  readonly items   = this._items.asReadonly();
  readonly count   = computed(() => this._items().reduce((s, i) => s + i.quantity, 0));
  readonly total   = computed(() => this._items().reduce((s, i) => s + i.price * i.quantity, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor(private http: HttpClient) {}

  addItem(item: Omit<CartItem, 'quantity'>) {
    const current = this._items();
    const existing = current.find(i => i.id === item.id);
    if (existing) {
      this._items.set(current.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      this._items.set([...current, { ...item, quantity: 1 }]);
    }
  }

  increaseQty(id: number) {
    this._items.set(this._items().map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  }

  decreaseQty(id: number) {
    const item = this._items().find(i => i.id === id);
    if (!item) return;
    if (item.quantity <= 1) {
      this.removeItem(id);
    } else {
      this._items.set(this._items().map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i));
    }
  }

  removeItem(id: number) {
    this._items.set(this._items().filter(i => i.id !== id));
  }

  clearCart() {
    this._items.set([]);
  }

  // ── Place Order ──
  placeOrder(token: string): Observable<OrderResponse> {
    const payload: OrderPayload = {
      items: this._items().map(i => ({
        menuItemId: i.id,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount: this.total()
    };
    return this.http.post<OrderResponse>(this.apiUrl, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }

  // ✅ Get user orders (for order status drawer)
  getOrders(token: string): Observable<UserOrder[]> {
    return this.http.get<UserOrder[]>(this.apiUrl, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}