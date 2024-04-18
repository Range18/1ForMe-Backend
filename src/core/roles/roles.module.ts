import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';
import { RolesService } from '#src/core/roles/roles.service';
import { rolesArray } from '#src/core/roles/roles.constants';
import { RolesController } from '#src/core/roles/roles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RolesEntity])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [RolesService],
})
export class RolesModule implements OnModuleInit {
  constructor(private readonly rolesService: RolesService) {}

  async onModuleInit() {
    const roles = await this.rolesService.find({});

    if (roles.length == 0) {
      const promises = rolesArray.map((role) => this.rolesService.save(role));

      await Promise.all(promises);
    }
  }
}
