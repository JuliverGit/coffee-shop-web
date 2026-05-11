import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading = true;
  toast = '';

  constructor(private adminService: AdminService, private zone: NgZone) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.zone.run(() => { this.users = data; this.loading = false; });
      },
      error: (err) => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  toggleBan(user: any) {
    const newBan = !user.is_banned;
    this.adminService.banUser(user.id, newBan).subscribe({
      next: () => {
        this.zone.run(() => {
          user.is_banned = newBan;
          this.showToast(newBan ? `${user.name} banned.` : `${user.name} unbanned.`);
        });
      },
      error: () => this.showToast('Failed to update user.')
    });
  }

  delete(user: any) {
    if (!confirm(`Delete user ${user.name}? This cannot be undone.`)) return;
    this.adminService.deleteUser(user.id).subscribe({
      next: () => { this.load(); this.showToast('User deleted.'); },
      error: () => this.showToast('Error deleting user.')
    });
  }

  showToast(msg: string) {
    this.zone.run(() => {
      this.toast = msg;
      setTimeout(() => this.toast = '', 3000);
    });
  }
}