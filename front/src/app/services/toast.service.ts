import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  success(text: string): void {
    this.addToast('success', text);
  }

  error(text: string): void {
    this.addToast('error', text);
  }

  info(text: string): void {
    this.addToast('info', text);
  }

  private addToast(type: ToastType, text: string): void {
    const id = crypto.randomUUID();
    const toast: ToastMessage = { id, type, text };
    this.toasts.set([...this.toasts(), toast]);

    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: string): void {
    this.toasts.set(this.toasts().filter((toast) => toast.id !== id));
  }
}
