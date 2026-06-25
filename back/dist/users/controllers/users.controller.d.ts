import { UsersService } from '../services/users.service';
import { UserRole } from '../user-role.enum';
import { DeleteAccountInput, UpdateEmailInput, UpdatePasswordInput, UpdateRoleInput } from '../user-inputs';
import { ForgotPasswordInput, LoginInput, RegisterInput, ResetPasswordInput, VerifyEmailInput } from '../../auth/auth.types';
export declare class AuthController {
    private readonly usersService;
    constructor(usersService: UsersService);
    register(body: RegisterInput): Promise<{
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
    login(body: LoginInput): Promise<{
        access_token: string;
        user: {
            id: number;
            email: string;
            role: UserRole;
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
        role: UserRole;
        createdAt: Date;
    }>;
}
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<Pick<import("../user.entity").UserEntity, "id" | "email" | "role" | "createdAt">[]>;
    updateMyPassword(req: any, body: UpdatePasswordInput): Promise<{
        message: string;
    }>;
    updateMyEmail(req: any, body: UpdateEmailInput): Promise<{
        message: string;
    }>;
    deleteMyAccount(req: any, body: DeleteAccountInput): Promise<Omit<import("../user.entity").UserEntity, "passwordHash">>;
    findOne(id: number): Promise<import("../user.entity").UserEntity>;
    updateRole(id: number, body: UpdateRoleInput, req: any): Promise<Pick<import("../user.entity").UserEntity, "id" | "email" | "role" | "createdAt">>;
}
