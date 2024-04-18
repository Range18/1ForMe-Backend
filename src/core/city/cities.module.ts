import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitiesService } from '#src/core/city/cities.service';
import { City } from '#src/core/city/entity/cities.entity';
import { CitiesController } from '#src/core/city/cities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  providers: [CitiesService],
  controllers: [CitiesController],
  exports: [CitiesService],
})
export class CitiesModule {}
