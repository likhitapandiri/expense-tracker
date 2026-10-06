import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { IndexLearningModule } from './index-learning/index-learning.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BudgetsModule } from './budgets/budgets.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    PrismaModule,
     ConfigModule.forRoot({isGlobal: true,}),
     UserModule,
     AnalyticsModule,
     IndexLearningModule,
     AuthModule,
     CategoriesModule,
     ExpensesModule,
     BudgetsModule,
     ReportsModule,
     HealthModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}