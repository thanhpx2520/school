import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CategoriesModule } from '../collections/categories/categories.module';
import { CommentsModule } from '../collections/comments/comments.module';
import { ProductsModule } from '../collections/products/products.module';
import { SlidersModule } from '../collections/sliders/sliders.module';
import { UsersModule } from '../collections/users/users.module';
import { StudentsModule } from '../collections/students/students.module';
import { ClassesModule } from '../collections/classes/classes.module';
import { AccountsModule } from '../collections/accounts/accounts.module';

@Module({
  imports: [
    CategoriesModule,
    CommentsModule,
    ProductsModule,
    SlidersModule,
    UsersModule,
    StudentsModule,
    ClassesModule,
    AccountsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
