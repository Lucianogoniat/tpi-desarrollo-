import {
	Injectable,
	UnauthorizedException,
	ConflictException,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user.entity';
import { UserRole } from '../user-role.enum';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../email/email.service';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepo: Repository<UserEntity>,
		private readonly jwtService: JwtService,
		private readonly cfg: ConfigService,
		private readonly emailService: EmailService,
	) {}

	async findAll(): Promise<Pick<UserEntity, 'id' | 'email' | 'role' | 'createdAt'>[]> {
		return this.usersRepo.find({
			select: {
				id: true,
				email: true,
				role: true,
				createdAt: true,
			},
		});
	}

	async findOneById(id: number): Promise<UserEntity> {
		const user = await this.usersRepo.findOne({ where: { id } });
		if (!user)
			throw new NotFoundException(`Usuario con id ${id} no encontrado`);
		return user;
	}

	async updateRole(
		id: number,
		role: UserRole,
		currentUserId: number,
	): Promise<Pick<UserEntity, 'id' | 'email' | 'role' | 'createdAt'>> {
		if (id === currentUserId) {
			throw new ForbiddenException('Cannot change your own role');
		}

		const user = await this.findOneById(id);
		if (user.role === UserRole.ADMIN && role === UserRole.USER) {
			const admins = await this.usersRepo.count({
				where: { role: UserRole.ADMIN },
			});
			if (admins <= 1) {
				throw new ForbiddenException('Cannot demote the only admin');
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

	async updateMyPassword(
		id: number,
		currentPassword: string,
		newPassword: string,
	): Promise<{ message: string }> {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.passwordHash')
			.where('u.id = :id', { id })
			.getOne();
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const ok = await bcrypt.compare(currentPassword, user.passwordHash);
		if (!ok) throw new UnauthorizedException('Credenciales inválidas');

		const rounds = Number(this.cfg.get<string>('BCRYPT_COST') ?? '12');
		user.passwordHash = await bcrypt.hash(newPassword, rounds);
		await this.usersRepo.save(user);
		return { message: 'Password updated' };
	}

	async updateMyEmail(
		id: number,
		newEmail: string,
		password: string,
	): Promise<{ message: string }> {
		const email = newEmail.trim().toLowerCase();
		const exists = await this.usersRepo.findOne({ where: { email } });
		if (exists && exists.id !== id) {
			throw new ConflictException('El email ya está registrado');
		}

		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.passwordHash')
			.where('u.id = :id', { id })
			.getOne();
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new UnauthorizedException('Credenciales inválidas');

		user.email = email;
		await this.usersRepo.save(user);
		return { message: 'Email updated' };
	}

	async deleteMyAccount(
		id: number,
		password: string,
	): Promise<Omit<UserEntity, 'passwordHash'>> {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.passwordHash')
			.where('u.id = :id', { id })
			.getOne();
		if (!user) throw new NotFoundException('Usuario no encontrado');

		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new UnauthorizedException('Credenciales inválidas');

		if (user.role === UserRole.ADMIN) {
			const admins = await this.usersRepo.count({
				where: { role: UserRole.ADMIN },
			});
			if (admins <= 1) {
				throw new ForbiddenException('Cannot demote the only admin');
			}
		}

		await this.usersRepo.remove(user);
		const { passwordHash, ...userWithoutPassword } = user;
		return { ...userWithoutPassword, id };
	}

	async register(email: string, plainPassword: string) {
		const exists = await this.usersRepo.findOne({
			where: { email: email.trim().toLowerCase() },
		});
		if (exists) {
			throw new ConflictException('El email ya está registrado');
		}

		const rounds = Number(this.cfg.get<string>('BCRYPT_COST') ?? '12');
		const passwordHash = await bcrypt.hash(plainPassword, rounds);

		const countUsers = await this.usersRepo.count();
		const role = countUsers === 0 ? UserRole.ADMIN : UserRole.USER;

		const verificationToken = randomUUID();
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

	async verifyEmail(token: string) {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.verificationToken')
			.where('u.verificationToken = :token', { token })
			.getOne();

		if (!user) {
			throw new BadRequestException('Token inválido o expirado');
		}

		user.isVerified = true;
		user.verificationToken = null;
		await this.usersRepo.save(user);

		return { message: 'Email verificado' };
	}

	async forgotPassword(email: string) {
		const user = await this.usersRepo.findOne({
			where: { email: email.trim().toLowerCase() },
		});

		if (user) {
			const resetPasswordToken = randomUUID();
			const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
			user.resetPasswordToken = resetPasswordToken;
			user.resetPasswordExpires = resetPasswordExpires;
			await this.usersRepo.save(user);
			await this.emailService.sendPasswordReset(user.email, resetPasswordToken);
		}

		return { message: 'Si el email existe, recibirás un link' };
	}

	async resetPassword(token: string, plainPassword: string) {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.resetPasswordToken')
			.addSelect('u.resetPasswordExpires')
			.where('u.resetPasswordToken = :token', { token })
			.andWhere('u.resetPasswordExpires > :now', { now: new Date() })
			.getOne();

		if (!user) {
			throw new BadRequestException('Token inválido o expirado');
		}

		const rounds = Number(this.cfg.get<string>('BCRYPT_COST') ?? '12');
		user.passwordHash = await bcrypt.hash(plainPassword, rounds);
		user.resetPasswordToken = null;
		user.resetPasswordExpires = null;
		await this.usersRepo.save(user);

		return { message: 'Contraseña actualizada' };
	}

	async resendVerification(userId: number) {
		const user = await this.usersRepo.findOne({ where: { id: userId } });
		if (!user) {
			throw new NotFoundException('Usuario no encontrado');
		}

		if (user.isVerified) {
			return { message: 'Email ya verificado' };
		}

		const verificationToken = randomUUID();
		user.verificationToken = verificationToken;
		await this.usersRepo.save(user);
		await this.emailService.sendVerification(user.email, verificationToken);

		return { message: 'Email de verificación reenviado' };
	}

	async login(email: string, plainPassword: string) {
		const user = await this.usersRepo
			.createQueryBuilder('u')
			.addSelect('u.passwordHash')
			.where('u.email = :email', { email: email.trim().toLowerCase() })
			.getOne();

		const INVALID = 'Credenciales inválidas';
		if (!user) throw new UnauthorizedException(INVALID);

		const ok = await bcrypt.compare(plainPassword, user.passwordHash);
		if (!ok) throw new UnauthorizedException(INVALID);
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
}
