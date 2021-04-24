import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const serverConfig: any = config.get('server');
  const logger = new Logger('bootstrap');

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors({ origin: serverConfig.origin });
  }

  const port = process.env.PORT || serverConfig.port;
  await app.listen(port);
  logger.log(`Application running on port ${port}`);
}
bootstrap();
