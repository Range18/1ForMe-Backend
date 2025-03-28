import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from '#src/common/exception-handler/exception.filter';
import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { backendServer } from '#src/common/configs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { flattenValidationErrors } from './common/utilities/flatten-validation-errors.func';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://1-for-me-frontend.vercel.app',
      'https://1-for-me-client-frontend.vercel.app',
      'https://1forme-admin.vercel.app',
      'https://1forme.ru',
      'https://trainer.1forme.ru',
    ],
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.flatMap((error) =>
          flattenValidationErrors(error),
        );
        return new BadRequestException({
          statusCode: 400,
          message: formattedErrors,
          error: 'Bad Request',
        });
      },
    }),
  );

  app.useBodyParser('text');

  app.enable('trust proxy');
  app.enableShutdownHooks();

  //TODO: uncomment and refactor code
  // app.setGlobalPrefix('/api', { exclude: ['/swagger'] });

  const config = new DocumentBuilder()
    .setTitle('1ForMe')
    .setVersion('0.0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(backendServer.port);
}

bootstrap();
