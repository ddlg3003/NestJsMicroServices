import { ApiProperty } from '@nestjs/swagger';

export class TodoDoc {
  @ApiProperty({
    example: '64298a9e297c788589ff502a',
  })
  id: string;

  @ApiProperty({
    example: 'Go to mall, buy new book',
  })
  title: string;

  @ApiProperty({
    example: false,
  })
  isComplete: boolean;

  @ApiProperty({
    example: '2023-04-02T14:01:02.160Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-04-02T14:01:02.160Z',
  })
  updatedAt: Date;
}
