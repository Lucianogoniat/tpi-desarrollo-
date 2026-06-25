import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-pending',
  templateUrl: './verify-pending.html',
  styleUrl: './verify-pending.css',
})
export class VerifyPendingPage {
  auth = inject(AuthService);
  private toast = inject(ToastService);
  loading = signal(false);

  async resendEmail(): Promise<void> {
    this.loading.set(true);

    try {
      await firstValueFrom(this.auth.resendVerification());
      this.toast.success('Email reenviado');
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Error al reenviar el email');
    } finally {
      this.loading.set(false);
    }
  }
}
