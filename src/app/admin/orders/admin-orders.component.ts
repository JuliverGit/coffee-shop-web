import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css']
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  toast = '';
  expandedOrder: number | null = null;
  statuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  constructor(private adminService: AdminService, private zone: NgZone) {}

  ngOnInit() { this.load(); }

  load() {
    if (!this.orders.length) this.loading = true;
    this.adminService.getOrders().subscribe({
      next: (data) => {
        this.zone.run(() => { this.orders = data; this.loading = false; });
      },
      error: () => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  toggleExpand(id: number) { this.expandedOrder = this.expandedOrder === id ? null : id; }

  updateStatus(order: any, status: string) {
    this.adminService.updateOrderStatus(order.id, status).subscribe({
      next: () => {
        this.zone.run(() => { order.status = status; this.showToast(`Order #${order.id} → ${status}`); });
      },
      error: () => this.showToast('Failed to update status.')
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#f59e0b', preparing: '#3b82f6', ready: '#8b5cf6', completed: '#10b981', cancelled: '#ef4444',
    };
    return map[status] ?? '#8a8078';
  }

  showToast(msg: string) {
    this.zone.run(() => { this.toast = msg; setTimeout(() => this.toast = '', 3000); });
  }
}