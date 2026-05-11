import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  try {
    const token = localStorage.getItem('remos_auth_token');
    if (!token) {
      router.navigate(['/']);
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload && payload.role === 'admin') {
      return true;
    }
  } catch (e) {
    console.error('Guard error:', e);
  }

  router.navigate(['/']);
  return false;
};