import { Controller, Param, Post } from '@nestjs/common';
import { IndexLearningService } from './index-learning.service';


//testing performance over 20 rows is like fake learning 
@Controller('index-learning')
export class IndexLearningController {
    constructor(private readonly indexLearningService: IndexLearningService) { }

    @Post(':id')
    addBulkExpenses(@Param('id') id:string){
        return this.indexLearningService.addBulkExpenses(Number(id));
    }
}
