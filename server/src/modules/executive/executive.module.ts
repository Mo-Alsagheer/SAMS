import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutiveController } from './executive.controller';
import { ExecutiveService } from './executive.service';
import { User } from '../users/entities/user.entity';
import { Application } from '../applications/entities/application.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Application])],
  controllers: [ExecutiveController],
  providers: [ExecutiveService]
})
export class ExecutiveModule {}
