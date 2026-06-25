import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPasswordPage {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  token = '';
  password = '';
  confirmPassword = '';
  loading = signal(true);
  success = signal(false);

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.loading.set(false);
  }

  async submit(): Promise<void> {
    if (!this.token) {
      this.toast.error('Token inválido o expirado');
      return;
    }

    if (this.password.length < 8) {
      this.toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);

    try {
      const response = await firstValueFrom(
        this.auth.resetPassword({ token: this.token, password: this.password }),
      );
      this.toast.success(response.message);
      this.success.set(true);
    } catch (err: any) {
      this.toast.error(err.error?.message || 'Token inválido o expirado');
    } finally {
      this.loading.set(false);
    }
  }

  goLogin(): void {
    this.router.navigate(['/login']);
  }
}
