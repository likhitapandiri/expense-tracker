import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { CategoriesModule } from 'src/categories/categories.module';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
  imports:[CategoriesModule,AuthModule,PrismaModule],
})
export class ExpensesModule {}
