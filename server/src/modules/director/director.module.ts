import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DirectorController } from './director.controller';
import { DirectorService } from './director.service';
import { Application } from '../applications/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';
import { RecruitmentProcess } from '../recruitment/entities/recruitment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, User, RecruitmentProcess]),
    ConfigModule,
    EmailModule,
  ],
  controllers: [DirectorController],
  providers: [DirectorService],
})
export class DirectorModule {}
