import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class SearchQuery {
  @ApiProperty({
    description: 'A search string to find your todo',
    example: 'Go to mall',
  })
  @IsNotEmpty()
  @IsString()
  keyword: string;

  @ApiProperty({
    description: 'Current page of response list, must be bigger than 0',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page: number;
}