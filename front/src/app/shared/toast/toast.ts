import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
})
export class Toast {
  toastService = inject(ToastService);

  close(id: string): void {
    this.toastService.removeToast(id);
  }

  trackByToast(index: number, toast: { id: string }): string {
    return toast.id;
  }
}
