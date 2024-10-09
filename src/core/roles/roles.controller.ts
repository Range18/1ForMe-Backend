import { Controller, Get, Param } from '@nestjs/common';
import { RolesService } from '#src/core/roles/roles.service';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { RolesEntity } from '#src/core/roles/entity/roles.entity';

@ApiTags('Roles')
@Controller('api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOkResponse({ type: [RolesEntity] })
  @Get()
  async getAllRoles() {
    return await this.rolesService.find({});
  }

  @ApiOkResponse({ type: RolesEntity })
  @Get(':id')
  async getRole(@Param('id') id: number) {
    return await this.rolesService.findOne({ where: { id } });
  }
}
