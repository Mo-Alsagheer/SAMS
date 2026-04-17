import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCommitteeByDirectorDto {
  @ApiPropertyOptional({
    example: 'We handle all technical tasks and software development.',
    description: 'A detailed description of the committee',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: 'https://chat.whatsapp.com/invite-link',
    description: 'The WhatsApp group invite link for the committee',
  })
  @IsUrl()
  @IsOptional()
  whatsappGroupLink?: string;
}
