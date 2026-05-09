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

  // ── Smooth Scroll ──
  scrollTo(event: Event, sectionId: string) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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