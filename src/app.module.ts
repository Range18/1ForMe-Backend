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
import { TrainingTypeModule } from '#src/core/training-type/training-type.module';
import { TrainingsModule } from '#src/core/trainings/trainings.module';
import { CommentsModule } from '#src/core/comments/comments.module';
import { TariffsModule } from '#src/core/tariffs/tariffs.module';
import { TransactionsModule } from '#src/core/transactions/transactions.module';
import { CitiesModule } from '#src/core/city/cities.module';
import { SportsModule } from '#src/core/sports/sports.module';
import { VerificationModule } from '#src/core/verification-codes/verification.module';
import { ClubsModule } from '#src/core/clubs/clubs.module';
import { SubscriptionsModule } from '#src/core/subscriptions/subscriptions.module';
import { SlotsModule } from '#src/core/slots/slots.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    UserModule,
    AuthModule,
    SessionModule,
    RolesModule,
    AssetsModule,
    VerificationModule,
    StudiosModule,
    CategoriesModule,
    TariffsModule,
    TrainingTypeModule,
    TrainingsModule,
    CommentsModule,
    TransactionsModule,
    CitiesModule,
    SportsModule,
    ClubsModule,
    SubscriptionsModule,
    SlotsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
