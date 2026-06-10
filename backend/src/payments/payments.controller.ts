import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { tempUploadInterceptor } from '../common/temp-upload.interceptor';
import { UploadsService } from '../uploads/uploads.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private uploadsService: UploadsService,
  ) {}

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('invoiceId') invoiceId?: string,
    @Query('clientId') clientId?: string,
    @Query('projectId') projectId?: string,
    @Query('method') method?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.paymentsService.findAll(user.studioId, {
      invoiceId,
      clientId,
      projectId,
      method,
      from,
      to,
    });
  }

  @Post('upload-proof')
  @UseInterceptors(tempUploadInterceptor())
  uploadProof(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ) {
    return this.uploadsService.savePaymentProof(file, user.studioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePaymentDto, @CurrentUser() user: AuthUser) {
    return this.paymentsService.create(dto, user.studioId, user.id);
  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.paymentsService.update(id, dto, user.studioId, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.paymentsService.remove(id, user.id);
  }
}
