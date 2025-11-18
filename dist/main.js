"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const all_exceptions_filterX_1 = require("./src/common/filters/all-exceptions.filterX");
const logging_interceptor_1 = require("./src/common/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalFilters(new all_exceptions_filterX_1.AllExceptionsFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const host = process.env.HOST;
    const port = Number(process.env.PORT);
    const frontendWebPort = process.env.FRONTEND_WEB_PORT;
    const frontendMobilePort = process.env.FRONTEND_MOBILE_PORT;
    const frontendUrlWeb = process.env.FRONTEND_URL_PROD_WEB || `http://${host}:${frontendWebPort}`;
    const frontendUrlMobile = process.env.FRONTEND_URL_PROD_MOBILE || `http://${host}:${frontendMobilePort}`;
    const localhostWeb = `http://localhost:${frontendWebPort}`;
    const localhostMobile = `http://localhost:${frontendMobilePort}`;
    const allowedOrigins = [frontendUrlWeb, frontendUrlMobile, localhostWeb, localhostMobile].filter((o) => !!o);
    app.enableCors({
        origin: allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    await app.listen(port, '0.0.0.0');
    const urlBackend = process.env.BACKEND_URL_PROD || `http://${host}:${port}`;
    console.log(`🚀 Server running on ${urlBackend}`);
    console.log('🌐 CORS allowed from:', allowedOrigins);
}
bootstrap();
//# sourceMappingURL=main.js.map