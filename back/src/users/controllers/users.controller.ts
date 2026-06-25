import {
	Controller,
	Get,
	Param,
	Post,
	Body,
	UseGuards,
	Req,
	Patch,
	Delete,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../user-role.enum';
import {
	DeleteAccountInput,
	UpdateEmailInput,
	UpdatePasswordInput,
	UpdateRoleInput,
} from '../user-inputs';
import {
	ForgotPasswordInput,
	LoginInput,
	RegisterInput,
	ResetPasswordInput,
	VerifyEmailInput,
} from '../../auth/auth.types';

@Controller('auth')
export class AuthController {
	constructor(private readonly usersService: UsersService) {}

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


@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	findAll() {
		return this.usersService.findAll();
	}

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	findOne(@Param('id') id: string) {
		return this.usersService.findOneById(id);
	}

	@Patch(':id/role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	updateRole(
		@Param('id') id: string,
		@Body() body: UpdateRoleInput,
		@Req() req: any,
	) {
		return this.usersService.updateRole(id, body.role, req.user.id);
	}

	@Patch('me/password')
	@UseGuards(JwtAuthGuard)
	updateMyPassword(
		@Req() req: any,
		@Body() body: UpdatePasswordInput,
	) {
		return this.usersService.updateMyPassword(
			req.user.id,
			body.currentPassword,
			body.newPassword,
		);
	}

	@Patch('me/email')
	@UseGuards(JwtAuthGuard)
	updateMyEmail(
		@Req() req: any,
		@Body() body: UpdateEmailInput,
	) {
		return this.usersService.updateMyEmail(
			req.user.id,
			body.newEmail,
			body.password,
		);
	}

	@Delete('me')
	@UseGuards(JwtAuthGuard)
	deleteMyAccount(@Req() req: any, @Body() body: DeleteAccountInput) {
		return this.usersService.deleteMyAccount(req.user.id, body.password);
	}
}
