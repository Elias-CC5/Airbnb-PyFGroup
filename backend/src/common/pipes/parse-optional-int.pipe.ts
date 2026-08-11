import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform<string | undefined, number | undefined> {
  transform(value?: string): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const parsed = Number(value);
    if (Number.isNaN(parsed)) throw new BadRequestException('Se esperaba un número');
    return parsed;
  }
}
