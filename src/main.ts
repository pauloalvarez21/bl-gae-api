import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const port = process.env.PORT ?? 3000;
    console.log(`Starting application on port ${port}...`);

    const app = await NestFactory.create(AppModule);

    // Habilitar validación global
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    // Habilitar CORS para el frontend (Flutter web, etc.)
    // En producción, restringir con CORS_ORIGIN (ej: https://miapp.com)
    app.enableCors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
      methods: 'GET,POST,PATCH,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    await app.listen(port);
    console.log(`Application running on port ${port}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}
bootstrap();