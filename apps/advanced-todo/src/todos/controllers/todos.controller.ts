import {
  Body,
  Controller,
  Post,
  Put,
  Param,
  Query,
  Get,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiParam,
  ApiConsumes,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { CreateTodoDto } from '../dtos/create-todo.dto';
import { UpdateTodoDto } from '../dtos/update-todo.dto';
import { Todo } from '../shemas/todo.schema';
import { TodosService } from '../services/todos.service';
import { ValidateMongoIdPipe } from '../pipes/validate-mongo-id.pipe';
import { TodoDoc } from '../types/todo-doc';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { multerOptions } from '../../config/multer.config';
import { resolve } from 'path';
import * as reader from 'xlsx';
import { convertDateExcel } from '../../utils/helperFunctions';
import { UPLOAD_PATH } from '../../utils/globalVariables';
import { SearchQuery } from '../dtos/search-query.dto';
import { FileUploadDto } from '../dtos/file-upload.dto';
import { FileIsDefinedValidator } from '../../utils/validation';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todoService: TodosService) {}

  @Post()
  @ApiBody({ type: CreateTodoDto })
  @ApiOperation({ summary: 'Create a todo' })
  @ApiCreatedResponse({
    description: 'Created todo',
    type: TodoDoc,
  })
  @ApiBadRequestResponse({
    description: 'Not pass title property in body',
  })
  async create(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return this.todoService.create(createTodoDto);
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'A valid xls file < 1MB',
    type: FileUploadDto,
  })
  @ApiOperation({ summary: 'Upload a todo xls file and import to database' })
  @ApiOkResponse({
    status: 201,
    description: 'Import completed',
  })
  @ApiBadRequestResponse({
    description: 'Not upload a xls file or upload a > 1MB file',
  })
  async readFileAndCreate(
    @UploadedFile(
      new ParseFilePipe({ validators: [new FileIsDefinedValidator()] }),
    )
    file: Express.Multer.File,
  ) {
    const xlsData = reader.readFile(resolve(__dirname, UPLOAD_PATH));
    const arrData: { title: string; createdAt: number }[] =
      reader.utils.sheet_to_json(xlsData.Sheets[xlsData.SheetNames[0]]);

    arrData
      .map(
        (data) =>
          new CreateTodoDto(data.title, convertDateExcel(data.createdAt)),
      )
      .forEach((todoXls) => {
        this.todoService.create(todoXls);
      });

    return {
      status: HttpStatus.CREATED,
      message: 'Upload completed',
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search todos using Elastic search' })
  @ApiOkResponse({
    description: 'Found todos',
    type: TodoDoc,
    isArray: true,
  })
  @ApiNotFoundResponse({
    description: 'No todos found',
  })
  async search(@Query() queries: SearchQuery): Promise<TodoDoc[]> {
    const data = await this.todoService.search(
      queries.keyword.toLowerCase(),
      queries.page,
    );

    if (!data.length) {
      throw new HttpException('No todos found', HttpStatus.NOT_FOUND);
    }

    return data;
  }

  @Put(':id')
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Should be an id of a todo that exists in the database',
    type: String,
    example: '64298a9e297c788589ff502a',
  })
  @ApiOperation({ summary: 'Update a todo' })
  @ApiOkResponse({
    description: 'Updated todo',
    type: TodoDoc,
  })
  @ApiBadRequestResponse({
    description: 'Not a valid id or isCompleted state',
  })
  async update(
    @Param('id', ValidateMongoIdPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.todoService.update(id, updateTodoDto);

    if (!todo) {
      throw new HttpException('Todo not exist', HttpStatus.BAD_REQUEST);
    }

    return todo;
  }
}
