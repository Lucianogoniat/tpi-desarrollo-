import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfilePage {
  auth = inject(AuthService);
  private toast = inject(ToastService);
  private users = inject(UsersService);
  loading = signal(false);
  passwordLoading = signal(false);
  emailLoading = signal(false);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  newEmail = '';
  emailPassword = '';

  async resendVerification(): Promise<void> {
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

  async changePassword(): Promise<void> {
    if (this.newPassword.length < 8) {
      this.toast.error('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toast.error('Las contraseñas no coinciden');
      return;
    }

    this.passwordLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.users.updateMyPassword({
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
        }),
      );
      this.toast.success(response.message);
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
    } catch (err: any) {
      this.toast.error(err.error?.message || 'No se pudo cambiar la contraseña');
    } finally {
      this.passwordLoading.set(false);
    }
  }

  async changeEmail(): Promise<void> {
    this.emailLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.users.updateMyEmail({
          newEmail: this.newEmail,
          password: this.emailPassword,
        }),
      );
      await firstValueFrom(this.auth.me());
      this.toast.success(response.message);
      this.newEmail = '';
      this.emailPassword = '';
    } catch (err: any) {
      this.toast.error(err.error?.message || 'No se pudo cambiar el email');
    } finally {
      this.emailLoading.set(false);
    }
  }
}
