import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth.service';


@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-shell.component.html',
  styleUrls: ['./admin-shell.component.css']
})
export class AdminShellComponent {
  isSidebarOpen = true;

  navItems = [
  { label: 'Dashboard', icon: 'fa-chart-line',  path: '/admin/dashboard' },
  { label: 'Menu',      icon: 'fa-mug-hot',     path: '/admin/menu'      },
  { label: 'Orders',    icon: 'fa-receipt',      path: '/admin/orders'    },
  { label: 'Users',     icon: 'fa-users',        path: '/admin/users'     },
  { label: 'Messages',  icon: 'fa-envelope',     path: '/admin/messages'  },
];

  constructor(private auth: AuthService, private router: Router) {}

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}