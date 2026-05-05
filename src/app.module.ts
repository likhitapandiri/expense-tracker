import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExpenseModule } from './expense/expense.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IndexLearningModule } from './index-learning/index-learning.module';

@Module({
  imports: [
    PrismaModule,
     ExpenseModule,
     ConfigModule.forRoot({isGlobal: true,}),
     UserModule,
     AnalyticsModule,
     IndexLearningModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}