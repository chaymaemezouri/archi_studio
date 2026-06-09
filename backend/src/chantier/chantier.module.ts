import { Module } from '@nestjs/common';
import { ChantierController } from './chantier.controller';
import { ChantierService } from './chantier.service';

@Module({
  controllers: [ChantierController],
  providers: [ChantierService],
})
export class ChantierModule {}
