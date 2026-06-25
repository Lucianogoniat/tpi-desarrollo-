import { UserRole } from './user-role.enum';
export declare class UpdateRoleInput {
    role: UserRole;
}
export declare class UpdatePasswordInput {
    currentPassword: string;
    newPassword: string;
}
export declare class UpdateEmailInput {
    newEmail: string;
    password: string;
}
export declare class DeleteAccountInput {
    password: string;
}
