import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyStatic from '@fastify/static';
import * as path from 'path';
import fastifyView from '@fastify/view';
import * as ejs from 'ejs';
import fastifyCookie from 'fastify-cookie';
import fastifyMultipart from '@fastify/multipart';

async function bootstrap() {
  const logger = new Logger('Main');
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);

  await app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/static/',
    cacheControl: true,
    maxAge: '1h',
  });

  await app.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, 'views'),
    viewExt: 'ejs',
  });

  await app.register(fastifyCookie);
  await app.register(fastifyMultipart);

  const port = configService.get<string>('app.port') || 4000;
  if (port) {
    await app.listen(port, () => {
      logger.log(`>>> Server running on port: ${port}`);
    });
  }
}

void bootstrap();
