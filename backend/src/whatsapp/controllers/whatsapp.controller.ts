import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators';
import { WhatsappLinkDto } from '../dto';
import { WhatsappService } from '../services/whatsapp.service';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Public()
  @Get('properties/:id/link')
  @ApiOperation({ summary: 'Enlace wa.me con mensaje precargado del alojamiento' })
  forProperty(@Param('id', ParseUUIDPipe) id: string, @Query() dto: WhatsappLinkDto) {
    return this.whatsappService.forProperty(id, dto);
  }

  @Public()
  @Get('support')
  support() {
    return this.whatsappService.support();
  }
}
