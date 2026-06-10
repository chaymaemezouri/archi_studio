import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { DevisService } from './devis.service';
import { CreateDevisDto } from './dto/create-devis.dto';
import { UpdateDevisDto } from './dto/update-devis.dto';

@Controller('devis')
export class DevisController {
  constructor(private devisService: DevisService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.devisService.findAll(user.studioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devisService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDevisDto, @CurrentUser() user: AuthUser) {
    return this.devisService.create(dto, user.studioId, user.id, user.role);
  }

  @Post(':id/convert-to-invoice')
  convertToInvoice(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.devisService.convertToInvoice(id, user.studioId, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDevisDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.devisService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.devisService.remove(id, user.id);
  }
}
