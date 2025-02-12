import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { corsOptions } from './config/cors-oprions.config';
import { AllExceptionFilter } from './all-exception.filter';
import AppConstants from './utility/app-constants';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));
  app.setGlobalPrefix(AppConstants.APP_GLOBAL_PREFIX);
  app.enableCors(corsOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerOptions = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Writify Docs')
    .setDescription('Swagger Docs for Writify')
    .setVersion('1.0')
    .addTag('Wrirtify Api')
    .addServer('http://localhost:3000/', 'Local environment')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup(`${AppConstants.APP_GLOBAL_PREFIX}/docs`, app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
