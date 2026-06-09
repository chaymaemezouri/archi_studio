import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChantierService } from './chantier.service';
import { CreateChantierLogDto } from './dto/create-chantier-log.dto';
import { UpdateChantierLogDto } from './dto/update-chantier-log.dto';

@Controller('chantier')
export class ChantierController {
  constructor(private chantierService: ChantierService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.chantierService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chantierService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateChantierLogDto) {
    return this.chantierService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChantierLogDto) {
    return this.chantierService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chantierService.remove(id);
  }
}
