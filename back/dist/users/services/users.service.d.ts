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
    findOneById(id: number): Promise<UserEntity>;
    updateRole(id: number, role: UserRole, currentUserId: number): Promise<Pick<UserEntity, 'id' | 'email' | 'role' | 'createdAt'>>;
    updateMyPassword(id: number, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    updateMyEmail(id: number, newEmail: string, password: string): Promise<{
        message: string;
    }>;
    deleteMyAccount(id: number, password: string): Promise<Omit<UserEntity, 'passwordHash'>>;
    register(email: string, plainPassword: string): Promise<{
        id: number;
        email: string;
        role: UserRole;
        isVerified: boolean;
        createdAt: Date;
        access_token: string;
        user: {
            id: number;
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
    resendVerification(userId: number): Promise<{
        message: string;
    }>;
    login(email: string, plainPassword: string): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            role: UserRole;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
}
