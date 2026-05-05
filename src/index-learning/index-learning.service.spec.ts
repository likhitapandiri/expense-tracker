import { Test, TestingModule } from '@nestjs/testing';
import { IndexLearningService } from './index-learning.service';

describe('IndexLearningService', () => {
  let service: IndexLearningService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndexLearningService],
    }).compile();

    service = module.get<IndexLearningService>(IndexLearningService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
