import { Routes } from '@angular/router';
import { AdminShellComponent } from './admin-shell/admin-shell.component';
import { AdminDashboardComponent } from './dashboard/admin-dashboard.component';
import { AdminMenuComponent } from './menu/admin-menu.component';
import { AdminOrdersComponent } from './orders/admin-orders.component';
import { AdminUsersComponent } from './users/admin-users.component';
import { AdminMessagesComponent } from './messages/admin-messages.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
      { path: '',          redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'menu',      component: AdminMenuComponent },
      { path: 'orders',    component: AdminOrdersComponent },
      { path: 'users',     component: AdminUsersComponent },
      { path: 'messages',  component: AdminMessagesComponent },
    ]
  }
];