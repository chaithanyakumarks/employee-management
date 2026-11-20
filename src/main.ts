import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe.js'
import { UtilsInterceptor } from './utils/utils.interceptor.js'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Employee } from './employee/entities/employee.entity.js'

process.loadEnvFile()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Employee Management API')
    .setDescription(`
      REST API for the employee directory.

      Login is public. Every other route requires a bearer token.
      List and profile accept ADMIN or EMPLOYEE. Create, fetch by id, update, and delete require ADMIN.

      Successful responses are wrapped as { statusCode, message, data }.
      Passwords are stored as bcrypt hashes and are omitted from responses.
    `,
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the access token returned by POST /employee/login.',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [Employee],
    autoTagControllers: false,
  });
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  app.useGlobalInterceptors(new UtilsInterceptor())

  await app.listen(process.env.PORT ?? 3000)
}

await bootstrap()
