import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ExpenseModule } from './expense/expense.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
     ExpenseModule,
     ConfigModule.forRoot({isGlobal: true,}),],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}