import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Env } from './shared/env';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle(Env.APP_NAME)
    .setDescription(`${Env.APP_DESCRIPTION} - ${Env.ENVIRONMENT}`)
    .addBearerAuth()
    .setVersion(Env.APP_VERSION)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  app.enableCors();

  await app.listen(Env.PORT, '0.0.0.0');
}

bootstrap().then(() => {
  console.log(`Server is running on port ${Env.PORT}`);
});
