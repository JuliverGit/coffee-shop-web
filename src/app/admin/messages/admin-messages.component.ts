import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.css']
})
export class AdminMessagesComponent implements OnInit {
  messages: any[] = [];
  loading = true;
  toast = '';

  constructor(private adminService: AdminService, private zone: NgZone) {}

  ngOnInit() { this.load(); }

  load() {
    if (!this.messages.length) this.loading = true;
    this.adminService.getMessages().subscribe({
      next: (data) => {
        this.zone.run(() => { this.messages = data; this.loading = false; });
      },
      error: () => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  markAsRead(msg: any) {
    this.adminService.markAsRead(msg.id).subscribe({
      next: () => {
        this.zone.run(() => { msg.is_read = true; this.showToast('Marked as read.'); });
      },
      error: () => this.showToast('Failed to update.')
    });
  }

  delete(msg: any) {
    if (!confirm('Delete this message?')) return;
    this.adminService.deleteMessage(msg.id).subscribe({
      next: () => { this.load(); this.showToast('Message deleted.'); },
      error: () => this.showToast('Error deleting message.')
    });
  }

  showToast(msg: string) {
    this.zone.run(() => { this.toast = msg; setTimeout(() => this.toast = '', 3000); });
  }
}