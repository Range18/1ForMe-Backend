import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TariffsService } from '#src/core/tariffs/tariffs.service';
import { TariffsController } from '#src/core/tariffs/tariffs.controller';
import { Tariff } from '#src/core/tariffs/entity/tariff.entity';
import { SessionModule } from '#src/core/session/session.module';
import { TokenModule } from '#src/core/token/token.module';
import { UserModule } from '#src/core/users/user.module';
import { ClubsModule } from '#src/core/clubs/clubs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tariff]),
    SessionModule,
    TokenModule,
    UserModule,
    ClubsModule,
  ],
  providers: [TariffsService],
  controllers: [TariffsController],
  exports: [TariffsService],
})
export class TariffsModule {
  // constructor(
  //   private TariffsService: TariffsService,
  //   private clubService: ClubsService,
  // ) {}
  // async onModuleInit(): Promise<void> {
  //   const clubs = await this.clubService.find({ relations: { studio: true } });
  //
  //   for (const club of clubs) {
  //     if (club.id === 8 || club.studio.id == 2) {
  //       club.tariffs = await this.TariffsService.find({
  //         where: { studio: { id: club.studio.id }, type: { id: Not(2) } },
  //       });
  //       await this.clubService.save(club);
  //       continue;
  //     }
  //     club.tariffs = await this.TariffsService.find({
  //       where: { studio: { id: club.studio.id } },
  //     });
  //     await this.clubService.save(club);
  //   }
  // }
}
