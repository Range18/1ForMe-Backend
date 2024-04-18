import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '#src/common/configs/database.config';
import { UserModule } from '#src/core/users/user.module';
import { AuthModule } from '#src/core/auth/auth.module';
import { SessionModule } from '#src/core/session/session.module';
import { RolesModule } from '#src/core/roles/roles.module';
import { AssetsModule } from '#src/core/assets/assets.module';
import { StudiosModule } from '#src/core/studios/studios.module';
import { CategoriesModule } from '#src/core/categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    AuthModule,
    SessionModule,
    RolesModule,
    AssetsModule,
    StudiosModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
