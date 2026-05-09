import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  isModalOpen = false;
  isMenuOpen = false;
  isCartOpen = false;

  // ── Cart ──
  cartItems: { name: string; price: number; quantity: number; image: string }[] = [];

  get cartCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get cartTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  addToCart(name: string, price: number, image: string) {
    const existing = this.cartItems.find(i => i.name === name);
    if (existing) {
      existing.quantity++;
    } else {
      this.cartItems.push({ name, price, quantity: 1, image });
    }
    this.isCartOpen = true;
  }

  increaseQty(item: any) {
    item.quantity++;
  }

  decreaseQty(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: any) {
    this.cartItems = this.cartItems.filter(i => i.name !== item.name);
  }

  clearCart() {
    this.cartItems = [];
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
  }

  closeCart() {
    this.isCartOpen = false;
  }

  checkout() {
    alert(`Order placed! Total: ₱${this.cartTotal}. Thank you!`);
    this.cartItems = [];
    this.isCartOpen = false;
  }

  // ── Smooth Scroll ──
  scrollTo(event: Event, sectionId: string) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ── Hamburger Menu ──
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  // ── Modal ──
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
    if ((event.target as HTMLElement).id === 'loginModal') {
      this.closeModal();
    }
  }

  onLoginSubmit() {
    alert('Login functionality coming soon!');
  }

  onContactSubmit() {
    alert('Message sent! We will get back to you soon.');
  }
}