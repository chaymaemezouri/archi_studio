import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CalendarModule } from './calendar/calendar.module';
import { ChantierModule } from './chantier/chantier.module';
import { ClientsModule } from './clients/clients.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DeadlinesModule } from './deadlines/deadlines.module';
import { DevisModule } from './devis/devis.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MeetingsModule } from './meetings/meetings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { PdfModule } from './pdf/pdf.module';
import { PrismaModule } from './prisma/prisma.module';
import { PlansRendersModule } from './plans-renders/plans-renders.module';
import { DocumentsModule } from './documents/documents.module';
import { ProjectFilesModule } from './project-files/project-files.module';
import { ProjectsModule } from './projects/projects.module';
import { SearchModule } from './search/search.module';
import { SettingsModule } from './settings/settings.module';
import { TasksModule } from './tasks/tasks.module';
import { TendersModule } from './tenders/tenders.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    ActivityLogsModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    SearchModule,
    ClientsModule,
    ProjectsModule,
    ProjectFilesModule,
    DocumentsModule,
    PlansRendersModule,
    TasksModule,
    DeadlinesModule,
    CalendarModule,
    MeetingsModule,
    ChantierModule,
    TendersModule,
    DevisModule,
    InvoicesModule,
    PaymentsModule,
    NotificationsModule,
    SettingsModule,
    UploadsModule,
    PdfModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
