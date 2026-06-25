import { IsEmail, IsString, IsUUID, MinLength } from 'class-validator';

export class RegisterInput {
	@IsEmail()
	email!: string;

	@IsString()
	@MinLength(8)
	password!: string;
}

export class LoginInput extends RegisterInput {}

export class VerifyEmailInput {
	@IsUUID()
	token!: string;
}

export class ForgotPasswordInput {
	@IsEmail()
	email!: string;
}

export class ResetPasswordInput extends VerifyEmailInput {
	@IsString()
	@MinLength(8)
	password!: string;
}
