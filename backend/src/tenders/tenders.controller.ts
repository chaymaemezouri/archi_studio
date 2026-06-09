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
import { CreateTenderDto } from './dto/create-tender.dto';
import { UpdateTenderDto } from './dto/update-tender.dto';
import { TendersService } from './tenders.service';

@Controller('tenders')
export class TendersController {
  constructor(private tendersService: TendersService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.tendersService.findAll(user.studioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tendersService.findOne(id, user.studioId);
  }

  @Post()
  create(@Body() dto: CreateTenderDto, @CurrentUser() user: AuthUser) {
    return this.tendersService.create(dto, user.studioId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTenderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tendersService.update(id, dto, user.studioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.tendersService.remove(id, user.studioId);
  }
}
