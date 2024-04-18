import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from '#src/core/categories/categories.service';
import { CategoriesController } from '#src/core/categories/categories.controller';
import { Category } from '#src/core/categories/entity/categories.entity';
import { UserEntity } from '#src/core/users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, UserEntity])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
