import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Signal } from '@angular/core';

import { MenuService, MenuItem } from './menu.service';
import { CartService, CartItem } from './cart.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {

  isModalOpen  = false;
  isMenuOpen   = false;
  isCartOpen   = false;
  isOrdering   = false;
  orderSuccess = false;
  isSignUpOpen = false;

  activeSection = 'home';
  private sectionObserver!: IntersectionObserver;
  private cardObserver!: IntersectionObserver;
  private isScrollingProgrammatically = false;
  private scrollEndTimer: any;

  toastMessage = '';
  toastVisible = false;
  private toastTimer: any;

  // ── Contact form ──
  contactName    = '';
  contactEmail   = '';
  contactSubject = '';
  contactMessage = '';

  // ── Menu filter ──
  activeFilter: 'all' | 'hot' | 'cold' = 'all';
  allMenuItems: MenuItem[] = [];
  menuItems:    MenuItem[] = [];

  // ── Menu card quantities (for quick-add on card) ──
  cardQty: { [id: number]: number } = {};

  cartItems!:   Signal<CartItem[]>;
  cartCount!:   Signal<number>;
  cartTotal!:   Signal<number>;
  isCartEmpty!: Signal<boolean>;
  isLoggedIn!:  Signal<boolean>;
  displayName!: Signal<string>;

  constructor(
    private menuService: MenuService,
    private cartService: CartService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.cartItems   = this.cartService.items;
    this.cartCount   = this.cartService.count;
    this.cartTotal   = this.cartService.total;
    this.isCartEmpty = this.cartService.isEmpty;
    this.isLoggedIn  = this.authService.isLoggedIn;
    this.displayName = this.authService.displayName;
  }

  // ── Toast ──
  showToast(message: string) {
    clearTimeout(this.toastTimer);
    this.toastVisible = false;
    this.toastMessage = message;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.toastVisible = true;
      this.cdr.detectChanges();

      this.toastTimer = setTimeout(() => {
        this.toastVisible = false;
        this.cdr.detectChanges();
      }, 3000);
    }, 50);
  }

  // ── Menu Filter ──
  setFilter(filter: 'all' | 'hot' | 'cold') {
    this.activeFilter = filter;
    this.menuItems = filter === 'all'
      ? this.allMenuItems
      : this.allMenuItems.filter(i => i.category === filter);
    setTimeout(() => this.observeCards(), 50);
  }

  // ── Card Qty Controls ──
  getCardQty(id: number): number {
    return this.cardQty[id] ?? 1;
  }

  increaseCardQty(id: number) {
    this.cardQty[id] = (this.cardQty[id] ?? 1) + 1;
  }

  decreaseCardQty(id: number) {
    this.cardQty[id] = Math.max(1, (this.cardQty[id] ?? 1) - 1);
  }

  // ── Cart ──
  addToCart(item: MenuItem) {
    const qty = this.getCardQty(item.id);
    for (let i = 0; i < qty; i++) {
      this.cartService.addItem({ id: item.id, name: item.name, price: item.price, image: item.image });
    }
    this.cardQty[item.id] = 1; // reset card qty after adding
    this.orderSuccess = false;
    this.isCartOpen   = true;
  }

  increaseQty(id: number) { this.cartService.increaseQty(id); }
  decreaseQty(id: number) { this.cartService.decreaseQty(id); }
  removeItem(id: number)  { this.cartService.removeItem(id); }

  clearCart() {
    this.cartService.clearCart();
    this.orderSuccess = false;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (!this.isCartOpen) this.orderSuccess = false;
  }

  closeCart() {
    this.isCartOpen  = false;
    this.orderSuccess = false;
  }

// ── Checkout ──
checkout() {
  if (this.isOrdering) return;

  // ✅ Login check
  if (!this.isLoggedIn()) {
    this.closeCart();
    this.openModal(new Event('click'));
    this.showToast('Please log in to place an order.');
    return;
  }

  this.isOrdering = true;
  this.cdr.detectChanges();

  const token = this.authService.getToken() ?? '';
  this.cartService.placeOrder(token).subscribe({
    next: (res) => {
      this.cartService.clearCart();
      this.isOrdering   = false;
      this.orderSuccess = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isCartOpen   = false;
        this.orderSuccess = false;
        this.cdr.detectChanges();
        this.showToast(`✓ Order confirmed! Est. ${res.estimatedTime} mins.`);
      }, 2500);
    },
    error: () => {
      this.isOrdering = false;
      this.cdr.detectChanges();
      this.showToast('Something went wrong. Please try again.');
    }
  });
}

  // ── Scroll ──
  scrollTo(event: Event, sectionId: string) {
    event.preventDefault();
    this.activeSection = sectionId;
    this.isScrollingProgrammatically = true;
    clearTimeout(this.scrollEndTimer);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    this.scrollEndTimer = setTimeout(() => {
      this.isScrollingProgrammatically = false;
    }, 800);
    if (this.isMenuOpen) this.isMenuOpen = false;
  }

  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }

  // ── Modal / Auth ──
  openModal(event: Event) {
    event.preventDefault();
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).id === 'loginModal') this.closeModal();
  }

  onLoginSubmit(email: string, password: string) {
    this.authService.login({ email, password }).subscribe({
      next:  (res) => { this.showToast(`Welcome, ${res.user.name}!`); this.closeModal(); },
      error: ()    => this.showToast('Login failed. Please check your credentials.')
    });
  }

  onLogout() {
  this.authService.logout();
  this.showToast('You have been logged out.');
}

  // ── Sign Up Modal ──
openSignUp(event: Event) {
  event.preventDefault();
  this.isModalOpen = false;
  this.isSignUpOpen = true;
  document.body.style.overflow = 'hidden';
}

closeSignUp() {
  this.isSignUpOpen = false;
  document.body.style.overflow = 'auto';
}

onSignUpOverlayClick(event: MouseEvent) {
  if ((event.target as HTMLElement).id === 'signupModal') this.closeSignUp();
}

onSignUpSubmit(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    this.showToast('Please fill in all fields.');
    return;
  }
  this.authService.register({ name, email, password }).subscribe({
    next: (res) => {
      this.showToast(`Welcome, ${res.user.name}! 🎉`);
      this.closeSignUp();
    },
    error: (err) => {
      const msg = err.error?.message || 'Registration failed.';
      this.showToast(msg);
    }
  });
}

  // ── Contact ──
  onContactSubmit(form: any) {
    this.contactName    = '';
    this.contactEmail   = '';
    this.contactSubject = '';
    this.contactMessage = '';
    form.resetForm();
    this.showToast("✓ Message sent! We'll get back to you soon.");
  }

  // ── Lifecycle ──
  ngOnInit() {
    this.authService.restoreSession();
    this.loadMenu();
    this.initSectionObserver();
    this.initCardObserver();
  }

  ngOnDestroy() {
    this.sectionObserver?.disconnect();
    this.cardObserver?.disconnect();
    clearTimeout(this.toastTimer);
    clearTimeout(this.scrollEndTimer);
  }

  private loadMenu() {
    this.menuService.getMenuItems().subscribe(items => {
      this.allMenuItems = items;
      this.menuItems    = items;
      // init all card quantities to 1
      items.forEach(i => this.cardQty[i.id] = 1);
      setTimeout(() => this.observeCards(), 100);
    });
  }

private initSectionObserver() {
  this.sectionObserver = new IntersectionObserver(
    entries => {
      if (this.isScrollingProgrammatically) return;

      entries.forEach(e => {
        if (e.isIntersecting) {
          this.activeSection = e.target.id;
          this.cdr.detectChanges();
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '-60px 0px -60% 0px'
    }
  );

  ['home', 'menu', 'about', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) this.sectionObserver.observe(el);
  });
}

  private initCardObserver() {
    this.cardObserver = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          this.cardObserver.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    setTimeout(() => this.observeCards(), 200);
  }

  private observeCards() {
    document.querySelectorAll(
      '.menu.item, .creator-card, .about-content, .contact-info, .contact-form'
    ).forEach(el => this.cardObserver?.observe(el));
  }
}