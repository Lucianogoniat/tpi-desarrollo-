import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  email = '';
  loading = signal(false);

  async submit(): Promise<void> {
    this.loading.set(true);

    try {
      const response = await firstValueFrom(this.auth.forgotPassword({ email: this.email }));
      this.toast.info(response.message);
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Error al enviar el link');
    } finally {
      this.loading.set(false);
    }
  }
}
