import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = null;
  loading = true;

  constructor(private adminService: AdminService, private zone: NgZone) {}

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.zone.run(() => { this.stats = data; this.loading = false; });
      },
      error: () => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  getStatusColor(status: string): string {
    const map: Record<string, string> = {
      pending: '#f59e0b', preparing: '#3b82f6', ready: '#8b5cf6', completed: '#10b981', cancelled: '#ef4444',
    };
    return map[status] ?? '#8a8078';
  }
}