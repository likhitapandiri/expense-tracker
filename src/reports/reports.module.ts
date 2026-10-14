import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports:[PrismaModule,AuthModule]
})
export class ReportsModule {}
