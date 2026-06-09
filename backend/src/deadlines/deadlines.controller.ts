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
import { DeadlinesService } from './deadlines.service';
import { CreateDeadlineDto } from './dto/create-deadline.dto';
import { UpdateDeadlineDto } from './dto/update-deadline.dto';

@Controller('deadlines')
export class DeadlinesController {
  constructor(private deadlinesService: DeadlinesService) {}

  @Get()
  findAll(@Query('projectId') projectId?: string) {
    return this.deadlinesService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deadlinesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDeadlineDto) {
    return this.deadlinesService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDeadlineDto) {
    return this.deadlinesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deadlinesService.remove(id);
  }
}
