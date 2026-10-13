import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { UsersController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
   imports: [AuthModule,PrismaModule],
  providers: [UserService],
  controllers: [UsersController]
})
export class UserModule {}
