import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { DevisModule } from '../devis/devis.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { PaymentsModule } from '../payments/payments.module';
import { SettingsModule } from '../settings/settings.module';
import { UploadsModule } from '../uploads/uploads.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    ClientsModule,
    DevisModule,
    InvoicesModule,
    PaymentsModule,
    SettingsModule,
    UploadsModule,
  ],
  controllers: [PdfController],
  providers: [PdfService],
  exports: [PdfService],
})
export class PdfModule {}
