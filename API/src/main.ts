import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({  //For the class validator
    whitelist: true,//filters out the elements that are not in our dto
  }));
  await app.listen(3000);
}

bootstrap();
