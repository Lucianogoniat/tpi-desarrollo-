import { UsersService } from '../users/services/users.service';
import { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput, VerifyEmailInput } from './auth.types';
export declare class AuthController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(body: RegisterInput): Promise<{
        id: number;
        email: string;
        role: import("../users/user-role.enum").UserRole;
        isVerified: boolean;
        createdAt: Date;
        access_token: string;
        user: {
            id: number;
            email: string;
            role: import("../users/user-role.enum").UserRole;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
    login(body: LoginInput): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            role: import("../users/user-role.enum").UserRole;
            isVerified: boolean;
            createdAt: Date;
        };
    }>;
    verifyEmail(body: VerifyEmailInput): Promise<{
        message: string;
    }>;
    forgotPassword(body: ForgotPasswordInput): Promise<{
        message: string;
    }>;
    resetPassword(body: ResetPasswordInput): Promise<{
        message: string;
    }>;
    resendVerification(req: any): Promise<{
        message: string;
    }>;
    findMe(req: any): Promise<{
        id: number;
        email: string;
        isVerified: boolean;
        verificationToken?: string | null;
        resetPasswordToken?: string | null;
        resetPasswordExpires?: Date | null;
        role: import("../users/user-role.enum").UserRole;
        createdAt: Date;
    }>;
}
