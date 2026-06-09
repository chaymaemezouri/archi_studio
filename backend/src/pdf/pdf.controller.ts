import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private pdfService: PdfService) {}

  @Get('devis/:id')
  async devisPdf(@Param('id') id: string, @Res({ passthrough: true }) res: Response) {
    const buffer = await this.pdfService.generateDevisPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="devis-${id}.pdf"`,
    });
    return new StreamableFile(buffer);
  }

  @Get('invoices/:id')
  async invoicePdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.pdfService.generateInvoicePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="facture-${id}.pdf"`,
    });
    return new StreamableFile(buffer);
  }

  @Get('payments/:id')
  async paymentReceiptPdf(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.pdfService.generatePaymentReceiptPdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="recu-paiement-${id}.pdf"`,
    });
    return new StreamableFile(buffer);
  }
}
