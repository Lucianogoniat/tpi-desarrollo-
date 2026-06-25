import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './products/product.entity';
import { CategoryEntity } from './categories/category.entity';
import { CategoriesModule } from './categories/categories.module';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { TimingMiddleware } from './common/middlewares/timing.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserEntity } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env', '.env.local', '.env.example'],
		}),
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (cfg: ConfigService) => {
				const databaseUrl = cfg.get<string>('DATABASE_URL');
				const useSsl = cfg.get<string>('DB_SSL') === 'true';

				return {
					type: 'postgres' as const,
					...(databaseUrl
						? { url: databaseUrl }
						: {
								host: cfg.get<string>('DB_HOST') ?? 'localhost',
								port: Number(cfg.get<string>('DB_PORT') ?? '5432'),
								username: cfg.get<string>('DB_USER') ?? 'postgres',
								password: cfg.get<string>('DB_PASSWORD') ?? 'postgres',
								database: cfg.get<string>('DB_NAME') ?? 'tp_final',
							}),
					entities: [ProductEntity, CategoryEntity, UserEntity],
					synchronize: cfg.get<string>('DB_SYNCHRONIZE') !== 'false',
					dropSchema: cfg.get<string>('DB_DROP_SCHEMA') === 'true',
					ssl: useSsl ? { rejectUnauthorized: false } : false,
				};
			},
		}),
		ProductsModule,
		CategoriesModule,
		EmailModule,
		UsersModule,
		AuthModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {
	configure(consumer: MiddlewareConsumer): void {
		consumer.apply(LoggerMiddleware, TimingMiddleware).forRoutes('*');
	}
}
