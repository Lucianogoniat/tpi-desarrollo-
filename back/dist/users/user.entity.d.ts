import { UserRole } from './user-role.enum';
export declare class UserEntity {
    id: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    verificationToken?: string | null;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    role: UserRole;
    createdAt: Date;
}
