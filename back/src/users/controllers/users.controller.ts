import {
	Controller,
	Get,
	Param,
	Body,
	UseGuards,
	Req,
	Patch,
	Delete,
	ParseIntPipe,
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

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) { }

	@Get('')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	findAll() {
		return this.usersService.findAll();
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

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.usersService.findOneById(id);
	}

	@Patch(':id/role')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles(UserRole.ADMIN)
	updateRole(
		@Param('id', ParseIntPipe) id: number,
		@Body() body: UpdateRoleInput,
		@Req() req: any,
	) {
		return this.usersService.updateRole(id, body.role, req.user.id);
	}
}
