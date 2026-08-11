import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { QueryUsersDto, UpdateUserDto, UpdateUserRoleDto } from '../dto';
import { UsersService } from '../services/users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Mi perfil' })
  me(@CurrentUser('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('me/stats')
  stats(@CurrentUser('id') id: string) {
    return this.usersService.stats(id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar mi perfil' })
  updateMe(@CurrentUser('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // ------------------------- administración -------------------------
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios (admin)' })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser('id') actorId: string,
  ) {
    return this.usersService.updateRole(id, dto, actorId);
  }

  @Patch(':id/activate')
  @Roles(Role.ADMIN)
  activate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.setActive(id, true, actorId);
  }

  @Patch(':id/deactivate')
  @Roles(Role.ADMIN)
  deactivate(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.setActive(id, false, actorId);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') actorId: string) {
    return this.usersService.softDelete(id, actorId);
  }
}
