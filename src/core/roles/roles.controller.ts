import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { RolesService } from '#src/core/roles/roles.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UpdateRoleDto } from '#src/core/roles/dto/update-role.dto';
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

  // TODO PERMS
  @ApiOkResponse({ type: RolesEntity })
  @ApiBody({ type: UpdateRoleDto })
  @Patch(':id')
  async updateRole(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.rolesService.updateOne({ where: { id } }, updateRoleDto);
  }
}
