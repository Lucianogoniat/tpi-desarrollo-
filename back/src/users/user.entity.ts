import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.enum';
@Entity('users')
export class UserEntity {
	@PrimaryGeneratedColumn()
	id!: number;
	@Column({ unique: true })
	email!: string;
	@Column({ select: false })
	passwordHash!: string;
	@Column({ default: false })
	isVerified!: boolean;
	@Column({ nullable: true, select: false, type: 'uuid' })
	verificationToken?: string | null;
	@Column({ nullable: true, select: false, type: 'uuid' })
	resetPasswordToken?: string | null;
	@Column({ nullable: true, select: false, type: 'timestamptz' })
	resetPasswordExpires?: Date | null;
	@Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
	role!: UserRole;
	@Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	createdAt!: Date;
}
