import { PartialType } from '@nestjs/swagger';
import { CreateAttendaceDto } from './create-attendace.dto';

export class UpdateAttendaceDto extends PartialType(CreateAttendaceDto) {}
