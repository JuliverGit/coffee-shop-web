import { Component, OnInit, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-menu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {
  items: any[] = [];
  loading = true;
  showForm = false;
  isEditing = false;
  saving = false;
  toast = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  form: any = this.blankForm();

  constructor(private adminService: AdminService, private zone: NgZone) {}

  ngOnInit() { this.load(); }

  load() {
    if (!this.items.length) this.loading = true;
    this.adminService.getMenuItems().subscribe({
      next: (data) => {
        this.zone.run(() => { this.items = data; this.loading = false; });
      },
      error: () => {
        this.zone.run(() => { this.loading = false; });
      }
    });
  }

  blankForm() {
    return { id: null, name: '', description: '', price: 0, image: '', category: 'hot', stock: 50, is_available: true };
  }

  openAdd() {
    this.form = this.blankForm();
    this.isEditing = false;
    this.showForm = true;
    this.selectedFile = null;
    this.previewUrl = null;
  }

  openEdit(item: any) {
    this.form = { ...item, is_available: !!item.is_available };
    this.isEditing = true;
    this.showForm = true;
    this.selectedFile = null;
    this.previewUrl = item.image || null;
  }

  closeForm() {
    this.showForm = false;
    this.selectedFile = null;
    this.previewUrl = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.zone.run(() => { this.previewUrl = e.target.result; });
    };
    reader.readAsDataURL(file);
  }

  save() {
    this.saving = true;

    const formData = new FormData();
    formData.append('name', this.form.name);
    formData.append('description', this.form.description || '');
    formData.append('price', this.form.price);
    formData.append('category', this.form.category);
    formData.append('stock', this.form.stock);
    formData.append('is_available', this.form.is_available ? '1' : '0');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    } else {
      formData.append('image', this.form.image || '');
    }

    const req = this.isEditing
      ? this.adminService.updateMenuItem(this.form.id, formData)
      : this.adminService.addMenuItem(formData);

    req.subscribe({
      next: () => {
        this.zone.run(() => {
          this.saving = false;
          this.closeForm();
          this.adminService.clearCache();
          this.load();
          this.showToast(this.isEditing ? 'Item updated!' : 'Item added!');
        });
      },
      error: () => {
        this.zone.run(() => { this.saving = false; this.showToast('Error saving item.'); });
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this item?')) return;
    this.adminService.deleteMenuItem(id).subscribe({
      next: () => { this.adminService.clearCache(); this.load(); this.showToast('Item deleted.'); },
      error: () => this.showToast('Error deleting item.')
    });
  }

  showToast(msg: string) {
    this.zone.run(() => { this.toast = msg; setTimeout(() => this.toast = '', 3000); });
  }
}