import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './src/common/filters/all-exceptions.filterX';
import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Filtro global de excepciones (Frontend)
  app.useGlobalFilters(new AllExceptionsFilter());

  // Interceptor global formato de logs HALL (Backend)
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Habilitar validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades que no están en el DTO
      forbidNonWhitelisted: true, // Lanza error si vienen propiedades extra
      transform: true, // Convierte automáticamente los tipos
    }),
  );

  // Configuración multiorigen para el Cors
  const host = process.env.HOST;
  const port = Number(process.env.PORT);

  const frontendWebPort = process.env.FRONTEND_WEB_PORT;
  const frontendMobilePort = process.env.FRONTEND_MOBILE_PORT;

  // URLs basadas en la IP/host del .env, revisando si es PROD o DEV
  const frontendUrlWeb = process.env.FRONTEND_URL_PROD_WEB || `http://${host}:${frontendWebPort}`;
  const frontendUrlMobile = process.env.FRONTEND_URL_PROD_MOBILE || `http://${host}:${frontendMobilePort}`;

  // URLs en localhost (para DEV en el mismo PC)
  const localhostWeb = `http://localhost:${frontendWebPort}`;
  const localhostMobile = `http://localhost:${frontendMobilePort}`;

  // Habilita CORS para ambos frontend: Web y Mobile
  const allowedOrigins = [frontendUrlWeb, frontendUrlMobile, localhostWeb, localhostMobile].filter((o): o is string => !!o); // <- type guard: elimina undefined

  app.enableCors({
    origin: allowedOrigins, // Frontend que hará las peticiones
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Recibe cookies o headers de auth
  });

  await app.listen(port, '0.0.0.0'); // 0.0.0.0 para aceptar otras máquinas de la red
  const urlBackend = process.env.BACKEND_URL_PROD || `http://${host}:${port}`;

  console.log(`🚀 Server running on ${urlBackend}`);
  console.log('🌐 CORS allowed from:', allowedOrigins);
}
bootstrap();
