import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateHostApplicationDto, UpdateHostProfileDto } from '../dto/host.dto';
import { HostsService } from '../services/hosts.service';

@ApiTags('Anfitriones')
@Controller('hosts')
export class HostsController {
  constructor(private readonly hosts: HostsService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mi situación en el programa de anfitriones' })
  me(@CurrentUser('id') userId: string) {
    return this.hosts.myStatus(userId);
  }

  @Post('applications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Solicitar ser anfitrión' })
  apply(@CurrentUser('id') userId: string, @Body() dto: CreateHostApplicationDto) {
    return this.hosts.apply(userId, dto);
  }

  @Get('me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mi perfil de anfitrión, con los datos operativos' })
  myProfile(@CurrentUser('id') userId: string) {
    return this.hosts.myProfile(userId);
  }

  @Patch('me/profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edita mi perfil público de anfitrión' })
  updateMyProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateHostProfileDto) {
    return this.hosts.updateMyProfile(userId, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Perfil público de un anfitrión' })
  publicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.hosts.publicProfile(id);
  }
}
