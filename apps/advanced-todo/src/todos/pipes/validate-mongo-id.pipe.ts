import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateMongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    if(!isValidObjectId(value)) {
      throw new HttpException('Id is not a valid MongoObjectId', HttpStatus.BAD_REQUEST);
    }

    return value;
  }
}
