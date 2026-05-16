import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number.parseInt(value, 10);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException(`"${value}" is not a valid numeric id`);
    }
    return id;
  }
}
