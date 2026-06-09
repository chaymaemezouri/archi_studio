import { Controller, Get, Res, StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { PdfService } from '../pdf/pdf.service';
import { settingsToPdfBranding } from '../pdf/pdf-branding';
import { SettingsService } from '../settings/settings.service';
import { UploadsService } from '../uploads/uploads.service';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private dashboardService: DashboardService,
    private pdfService: PdfService,
    private settingsService: SettingsService,
    private uploadsService: UploadsService,
  ) {}

  @Get('overview')
  getOverview(@CurrentUser() user: AuthUser) {
    return this.dashboardService.getOverview(user.studioId, user.id);
  }

  @Get('weekly-summary/pdf')
  async weeklySummaryPdf(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const overview = await this.dashboardService.getOverview(
      user.studioId,
      user.id,
    );
    const settings = await this.settingsService.get(user.studioId);
    const branding = settingsToPdfBranding(settings, this.uploadsService);
    const buffer = await this.pdfService.generateWeeklySummaryPdf(
      settings.cabinetName ?? 'Cabinet',
      overview,
      branding,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume-hebdo-${new Date().toISOString().slice(0, 10)}.pdf"`,
    });
    return new StreamableFile(buffer);
  }
}
