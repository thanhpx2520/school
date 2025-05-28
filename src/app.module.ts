import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { MongoModule } from './modules/database/mongo/mongo.module';
import { CategoriesModule } from './modules/collections/categories/categories.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';
import { CommentsModule } from './modules/collections/comments/comments.module';
import { ProductsModule } from './modules/collections/products/products.module';
import { UsersModule } from './modules/collections/users/users.module';
import { StudentsModule } from './modules/collections/students/students.module';
import { ClassesModule } from './modules/collections/classes/classes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [appConfig],
      isGlobal: true,
    }),
    MongoModule,
    CategoriesModule,
    CommentsModule,
    ProductsModule,
    UsersModule,
    StudentsModule,
    ClassesModule,
    AdminModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
