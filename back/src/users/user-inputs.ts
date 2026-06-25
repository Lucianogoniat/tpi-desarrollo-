import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from './user-role.enum';

export class UpdateRoleInput {
	@IsEnum(UserRole)
	role!: UserRole;
}

export class UpdatePasswordInput {
	@IsString()
	currentPassword!: string;

	@IsString()
	@MinLength(8)
	newPassword!: string;
}

export class UpdateEmailInput {
	@IsEmail()
	newEmail!: string;

	@IsString()
	password!: string;
}

export class DeleteAccountInput {
	@IsString()
	password!: string;
}
