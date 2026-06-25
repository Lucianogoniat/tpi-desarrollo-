import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../user.entity';
import { UserRole } from '../user-role.enum';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../email/email.service';
export declare class UsersService {
    private readonly usersRepo;
    private readonly jwtService;
    private readonly cfg;
    private readonly emailService;
    constructor(usersRepo: Repository<UserEntity>, jwtService: JwtService, cfg: ConfigService, emailService: EmailService);
    findAll(): Promise<Pick<UserEntity, 'id' | 'email' | 'role' | 'createdAt'>[]>;
    findOneById(id: string): Promise<UserEntity>;
    updateRole(id: string, role: UserRole, currentUserId: string): Promise<Pick<UserEntity, 'id' | 'email' | 'role' | 'createdAt'>>;
    updateMyPassword(id: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    updateMyEmail(id: string, newEmail: string, password: string): Promise<{
        message: string;
    }>;
    deleteMyAccount(id: string, password: string): Promise<Omit<UserEntity, 'passwordHash'>>;
    register(email: string, plainPassword: string): Promise<{
        id: string;
        email: string;
        role: UserRole;
        isVerified: boolean;
        createdAt: Date;
        access_token: string;
        user: {
            id: string;
            email: string;
            role: UserRole;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    resetPassword(token: string, plainPassword: string): Promise<{
        message: string;
    }>;
    resendVerification(userId: string): Promise<{
        message: string;
    }>;
    login(email: string, plainPassword: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: UserRole;
            createdAt: Date;
        };
    }>;
}
