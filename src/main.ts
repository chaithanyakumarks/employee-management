import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe.js';
import { UtilsInterceptor } from './utils/utils.interceptor.js';

process.loadEnvFile();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true
    })
  );

  app.useGlobalInterceptors(new UtilsInterceptor())
  
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
