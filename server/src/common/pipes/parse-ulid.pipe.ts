import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValid } from 'ulid';

@Injectable()
export class ParseUlidPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isValid(value)) {
      throw new BadRequestException(`"${value}" is not a valid ULID`);
    }
    return value;
  }
}
