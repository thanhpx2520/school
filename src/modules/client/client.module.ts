import { Module } from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientController } from './client.controller';
import { CategoriesModule } from '../collections/categories/categories.module';
import { CommentsModule } from '../collections/comments/comments.module';
import { ProductsModule } from '../collections/products/products.module';
import { SlidersModule } from '../collections/sliders/sliders.module';
import { UsersModule } from '../collections/users/users.module';

@Module({
  imports: [
    CategoriesModule,
    CommentsModule,
    ProductsModule,
    SlidersModule,
    UsersModule,
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
