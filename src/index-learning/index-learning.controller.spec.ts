import { Test, TestingModule } from '@nestjs/testing';
import { IndexLearningController } from './index-learning.controller';

describe('IndexLearningController', () => {
  let controller: IndexLearningController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndexLearningController],
    }).compile();

    controller = module.get<IndexLearningController>(IndexLearningController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
