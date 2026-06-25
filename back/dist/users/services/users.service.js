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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("../user.entity");
const user_role_enum_1 = require("../user-role.enum");
const jwt_1 = require("@nestjs/jwt");
const email_service_1 = require("../../email/email.service");
let UsersService = class UsersService {
    usersRepo;
    jwtService;
    cfg;
    emailService;
    constructor(usersRepo, jwtService, cfg, emailService) {
        this.usersRepo = usersRepo;
        this.jwtService = jwtService;
        this.cfg = cfg;
        this.emailService = emailService;
    }
    async findAll() {
        return this.usersRepo.find({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }
    async findOneById(id) {
        const user = await this.usersRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`Usuario con id ${id} no encontrado`);
        return user;
    }
    async updateRole(id, role, currentUserId) {
        if (id === currentUserId) {
            throw new common_1.ForbiddenException('Cannot change your own role');
        }
        const user = await this.findOneById(id);
        if (user.role === user_role_enum_1.UserRole.ADMIN && role === user_role_enum_1.UserRole.USER) {
            const admins = await this.usersRepo.count({
                where: { role: user_role_enum_1.UserRole.ADMIN },
            });
            if (admins <= 1) {
                throw new common_1.ForbiddenException('Cannot demote the only admin');
            }
        }
        user.role = role;
        const saved = await this.usersRepo.save(user);
        return {
            id: saved.id,
            email: saved.email,
            role: saved.role,
            createdAt: saved.createdAt,
        };
    }
    async updateMyPassword(id, currentPassword, newPassword) {
        const user = await this.usersRepo
            .createQueryBuilder('u')
            .addSelect('u.passwordHash')
            .where('u.id = :id', { id })
            .getOne();
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const ok = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        const rounds = Number(this.cfg.get('BCRYPT_COST') ?? '12');
        user.passwordHash = await bcrypt.hash(newPassword, rounds);
        await this.usersRepo.save(user);
        return { message: 'Password updated' };
    }
    async updateMyEmail(id, newEmail, password) {
        const email = newEmail.trim().toLowerCase();
        const exists = await this.usersRepo.findOne({ where: { email } });
        if (exists && exists.id !== id) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const user = await this.usersRepo
            .createQueryBuilder('u')
            .addSelect('u.passwordHash')
            .where('u.id = :id', { id })
            .getOne();
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        user.email = email;
        await this.usersRepo.save(user);
        return { message: 'Email updated' };
    }
    async deleteMyAccount(id, password) {
        const user = await this.usersRepo
            .createQueryBuilder('u')
            .addSelect('u.passwordHash')
            .where('u.id = :id', { id })
            .getOne();
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        if (user.role === user_role_enum_1.UserRole.ADMIN) {
            const admins = await this.usersRepo.count({
                where: { role: user_role_enum_1.UserRole.ADMIN },
            });
            if (admins <= 1) {
                throw new common_1.ForbiddenException('Cannot demote the only admin');
            }
        }
        await this.usersRepo.remove(user);
        const { passwordHash, ...userWithoutPassword } = user;
        return { ...userWithoutPassword, id };
    }
    async register(email, plainPassword) {
        const exists = await this.usersRepo.findOne({
            where: { email: email.trim().toLowerCase() },
        });
        if (exists) {
            throw new common_1.ConflictException('El email ya está registrado');
        }
        const rounds = Number(this.cfg.get('BCRYPT_COST') ?? '12');
        const passwordHash = await bcrypt.hash(plainPassword, rounds);
        const countUsers = await this.usersRepo.count();
        const role = countUsers === 0 ? user_role_enum_1.UserRole.ADMIN : user_role_enum_1.UserRole.USER;
        const verificationToken = (0, crypto_1.randomUUID)();
        const entity = this.usersRepo.create({
            email: email.trim().toLowerCase(),
            passwordHash,
            role,
            isVerified: false,
            verificationToken,
        });
        const saved = await this.usersRepo.save(entity);
        await this.emailService.sendVerification(saved.email, verificationToken);
        const access_token = this.jwtService.sign({
            sub: saved.id,
            role: saved.role,
        });
        const user = {
            id: saved.id,
            email: saved.email,
            role: saved.role,
            isVerified: saved.isVerified,
            createdAt: saved.createdAt,
        };
        return {
            access_token,
            user,
            ...user,
        };
    }
    async verifyEmail(token) {
        const user = await this.usersRepo
            .createQueryBuilder('u')
            .addSelect('u.verificationToken')
            .where('u.verificationToken = :token', { token })
            .getOne();
        if (!user) {
            throw new common_1.BadRequestException('Token inválido o expirado');
        }
        user.isVerified = true;
        user.verificationToken = null;
        await this.usersRepo.save(user);
        return { message: 'Email verificado' };
    }
    async forgotPassword(email) {
        const user = await this.usersRepo.findOne({
            where: { email: email.trim().toLowerCase() },
        });
        if (user) {
            const resetPasswordToken = (0, crypto_1.randomUUID)();
            const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
            user.resetPasswordToken = resetPasswordToken;
            user.resetPasswordExpires = resetPasswordExpires;
            await this.usersRepo.save(user);
            await this.emailService.sendPasswordReset(user.email, resetPasswordToken);
        }
        return { message: 'Si el email existe, recibirás un link' };
    }
    async resetPassword(token, plainPassword) {
        const user = await this.usersRepo
            .createQueryBuilder('u')
            .addSelect('u.resetPasswordToken')
            .addSelect('u.resetPasswordExpires')
            .where('u.resetPasswordToken = :token', { token })
            .andWhere('u.resetPasswordExpires > :now', { now: new Date() })
            .getOne();
        if (!user) {
            throw new common_1.BadRequestException('Token inválido o expirado');
        }
        const rounds = Number(this.cfg.get('BCRYPT_COST') ?? '12');
        user.passwordHash = await bcrypt.hash(plainPassword, rounds);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.usersRepo.save(user);
        return { message: 'Contraseña actualizada' };
    }
    async resendVerification(userId) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        if (user.isVerified) {
            throw new common_1.ConflictException('Email ya verificado');
        }
        const verificationToken = (0, crypto_1.randomUUID)();
        user.verificationToken = verificationToken;
        await this.usersRepo.save(user);
        await this.emailService.sendVerification(user.email, verificationToken);
        return { message: 'Email de verificación reenviado' };
    }
    async login(email, plainPassword) {
        const user = await this.usersRepo
            .createQueryBuilder('u')
            .addSelect('u.passwordHash')
            .where('u.email = :email', { email: email.trim().toLowerCase() })
            .getOne();
        const INVALID = 'Credenciales inválidas';
        if (!user)
            throw new common_1.UnauthorizedException(INVALID);
        const ok = await bcrypt.compare(plainPassword, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException(INVALID);
        const access_token = this.jwtService.sign({
            sub: user.id,
            role: user.role,
        });
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            },
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], UsersService);
//# sourceMappingURL=users.service.js.map