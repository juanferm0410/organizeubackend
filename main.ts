import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './src/common/filters/all-exceptions.filterX';
import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aplica el filtro global de excepciones (front)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Aplica el interceptor global formato de logs HALL (back)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Habilitar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,              // elimina propiedades que no están en el DTO
    forbidNonWhitelisted: true,   // lanza error si vienen propiedades extra
    transform: true,              // convierte automáticamente los tipos
  }));

  // Habilita CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL, // Frontend que hará las peticiones
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,                // Recibe cookies o headers de auth
  });

  await app.listen(3000);
  console.log(`🚀 Server running on ${process.env.BACKEND_URL}`);
}
bootstrap();