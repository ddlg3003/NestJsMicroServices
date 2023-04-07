import { HttpException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerOptions = {
  storage: diskStorage({
    destination: './uploads/todos',
    filename: (req: any, file: any, callback: any) => {
      callback(null, `${file.originalname.split('.')[0]}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (request: any, file: any, callback: any) => {
    if (!file.mimetype.includes('application/vnd.ms-excel')) {
      return callback(
        new HttpException(
          'Invalid file type. Expected: xls',
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );  
    }
    callback(null, true);
  },
  limits: {
    fieldSize: 1024 ** 2,
  },
};
