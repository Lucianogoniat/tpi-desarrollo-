import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmailPage {
  auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(true);
  success = signal(false);

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) {
      this.success.set(false);
      this.toast.error('Token inválido o expirado');
      this.loading.set(false);
      return;
    }

    try {
      await firstValueFrom(this.auth.verifyEmail({ token }));
      this.success.set(true);
      this.toast.success('Email verificado correctamente');
    } catch (err: any) {
      this.success.set(false);
      this.toast.error(err.error?.message || 'Token inválido o expirado');
    } finally {
      this.loading.set(false);
    }
  }

  async resendEmail(): Promise<void> {
    try {
      await firstValueFrom(this.auth.resendVerification());
      this.toast.success('Email reenviado');
    } catch (err: any) {
      this.toast.error(
        err.status === 401
          ? 'Iniciá sesión para solicitar un nuevo enlace'
          : err.error?.message || 'No se pudo reenviar el email',
      );
    }
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}
