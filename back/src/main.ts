import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Header requerido por Chrome para permitir fetch a localhost desde orígenes externos
  // Debe ir ANTES de enableCors para que se incluya en el preflight OPTIONS
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    next();
  });

  // Habilitar CORS
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Access-Control-Allow-Private-Network'],
  });

  app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // elimina campos no declarados en el DTO
			forbidNonWhitelisted: true, // lanza error si llegan campos extra
			transform: true, // convierte tipos automáticamente (string → number, etc.)
		}),
	);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
