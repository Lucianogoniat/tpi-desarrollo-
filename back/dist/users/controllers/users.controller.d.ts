import { UsersService } from '../services/users.service';
import { DeleteAccountInput, UpdateEmailInput, UpdatePasswordInput, UpdateRoleInput } from '../user-inputs';
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
