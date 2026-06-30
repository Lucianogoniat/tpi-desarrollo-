import {
	Controller,
	Get,
	Post,
	Body,
	UseGuards,
	Req,
	HttpCode,
} from '@nestjs/common';
import { UsersService } from '../users/services/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
	ForgotPasswordInput,
	LoginInput,
	RegisterInput,
	ResetPasswordInput,
	VerifyEmailInput,
} from './auth.types';

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService) { }

	@Post('register')
	register(@Body() body: RegisterInput) {
		return this.usersService.register(body.email, body.password);
	}

	@Post('login')
	login(@Body() body: LoginInput) {
		return this.usersService.login(body.email, body.password);
	}

	@Post('verify-email')
	verifyEmail(@Body() body: VerifyEmailInput) {
		return this.usersService.verifyEmail(body.token);
	}

	@Post('forgot-password')
	forgotPassword(@Body() body: ForgotPasswordInput) {
		return this.usersService.forgotPassword(body.email);
	}

	@Post('reset-password')
	resetPassword(@Body() body: ResetPasswordInput) {
		return this.usersService.resetPassword(body.token, body.password);
	}

	@Post('resend-verification')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	resendVerification(@Req() req: any) {
		return this.usersService.resendVerification(req.user.id);
	}

	@Get('me')
	@UseGuards(JwtAuthGuard)
	async findMe(@Req() req: any) {
		const userId = req.user.id;
		const user = await this.usersService.findOneById(userId);
		const { passwordHash, ...userWithoutPassword } = user;
		return userWithoutPassword;
	}
}
