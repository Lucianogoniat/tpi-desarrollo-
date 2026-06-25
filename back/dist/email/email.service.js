"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = class EmailService {
    cfg;
    constructor(cfg) {
        this.cfg = cfg;
    }
    async sendVerification(email, token) {
        const baseUrl = this.cfg.get('EMAIL_CONFIRM_URL') ??
            'http://localhost:4200/verify-email';
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`;
        await this.send(email, 'Verifica tu email', `<p>Gracias por registrarte.</p><p><a href="${url}">Verificar email</a></p>`);
    }
    async sendPasswordReset(email, token) {
        const baseUrl = this.cfg.get('EMAIL_RESET_URL') ??
            'http://localhost:4200/reset-password';
        const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}token=${token}`;
        await this.send(email, 'Restablece tu contraseña', `<p>Recibimos una solicitud para cambiar tu contraseña.</p><p><a href="${url}">Restablecer contraseña</a></p>`);
    }
    async send(to, subject, html) {
        const mode = this.cfg.get('EMAIL_MODE') ??
            (process.env.NODE_ENV === 'production' ? 'smtp' : 'test');
        const from = this.cfg.get('EMAIL_FROM') ??
            'TPI Desarrollo <no-reply@example.com>';
        if (mode === 'test') {
            const testAccount = await nodemailer.createTestAccount();
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            const info = await transporter.sendMail({ from, to, subject, html });
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`📧 Email enviado (Ethereal preview): ${previewUrl}`);
            return;
        }
        const host = this.cfg.get('EMAIL_HOST');
        if (!host) {
            throw new common_1.ServiceUnavailableException('El servicio de email no está configurado');
        }
        const user = this.cfg.get('EMAIL_USER');
        const pass = this.cfg.get('EMAIL_PASS');
        const transporter = nodemailer.createTransport({
            host,
            port: Number(this.cfg.get('EMAIL_PORT') ?? '587'),
            secure: this.cfg.get('EMAIL_SECURE') === 'true',
            auth: user && pass ? { user, pass } : undefined,
        });
        await transporter.sendMail({ from, to, subject, html });
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map