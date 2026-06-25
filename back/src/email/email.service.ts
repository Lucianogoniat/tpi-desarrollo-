import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
	constructor(private readonly cfg: ConfigService) {}

	async sendVerification(email: string, token: string): Promise<void> {
		const baseUrl =
			this.cfg.get<string>('EMAIL_CONFIRM_URL') ??
			'http://localhost:4200/verify-email';
		const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`;

		await this.send(
			email,
			'Verifica tu email',
			`<p>Gracias por registrarte.</p><p><a href="${url}">Verificar email</a></p>`,
		);
	}

	async sendPasswordReset(email: string, token: string): Promise<void> {
		const baseUrl =
			this.cfg.get<string>('EMAIL_RESET_URL') ??
			'http://localhost:4200/reset-password';
		const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`;

		await this.send(
			email,
			'Restablece tu contraseña',
			`<p>Recibimos una solicitud para cambiar tu contraseña.</p><p><a href="${url}">Restablecer contraseña</a></p>`,
		);
	}

	private async send(to: string, subject: string, html: string): Promise<void> {
		// En desarrollo local simulamos el envío para que la API sea ejecutable
		// sin credenciales SMTP. Producción sigue exigiendo una configuración real.
		const mode =
			this.cfg.get<string>('EMAIL_MODE') ??
			(process.env.NODE_ENV === 'production' ? 'smtp' : 'test');
		const from =
			this.cfg.get<string>('EMAIL_FROM') ??
			'TPI Desarrollo <no-reply@example.com>';

		if (mode === 'test') {
			const transporter = nodemailer.createTransport({ jsonTransport: true });
			await transporter.sendMail({ from, to, subject, html });
			return;
		}

		const host = this.cfg.get<string>('EMAIL_HOST');
		if (!host) {
			throw new ServiceUnavailableException(
				'El servicio de email no está configurado',
			);
		}

		const user = this.cfg.get<string>('EMAIL_USER');
		const pass = this.cfg.get<string>('EMAIL_PASS');
		const transporter = nodemailer.createTransport({
			host,
			port: Number(this.cfg.get<string>('EMAIL_PORT') ?? '587'),
			secure: this.cfg.get<string>('EMAIL_SECURE') === 'true',
			auth: user && pass ? { user, pass } : undefined,
		});

		await transporter.sendMail({ from, to, subject, html });
	}
}
