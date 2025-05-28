import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import databaseConfig from 'src/config/database.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        uri: config.mongo.uri,
        onConnectionCreate: (connect: Connection) => {
          const logger = new Logger('MongoModule');
          connect.on('connected', () => logger.log('>>> DB connected'));
          connect.on('open', () => logger.log('>>> DB open'));
          connect.on('disconnected', () => logger.warn('>>> DB disconnected'));
          connect.on('reconnected', () => logger.log('>>> DB reconnected'));
          connect.on('disconnecting', () =>
            logger.warn('>>> DB disconnecting'),
          );
          connect.on('error', () =>
            logger.error('>>> Can not connect to DB, please check .env file '),
          );
          return connect;
        },
      }),
      inject: [databaseConfig.KEY],
    }),
  ],
})
export class MongoModule {}
