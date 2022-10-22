import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} no es un MongoId valido`)
    }

    return value;
  }
}
