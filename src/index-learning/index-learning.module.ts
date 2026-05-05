import { Module } from '@nestjs/common';
import { IndexLearningController } from './index-learning.controller';
import { IndexLearningService } from './index-learning.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IndexLearningController],
  providers: [IndexLearningService]
})
export class IndexLearningModule {}
