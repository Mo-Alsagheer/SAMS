import { Module } from '@nestjs/common';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';
import { DirectorCommitteesController } from './director-committees.controller';
import { ExecutiveCommitteesController } from './executive-committees.controller';

@Module({
  controllers: [
    CommitteesController,
    ExecutiveCommitteesController,
    DirectorCommitteesController,
  ],
  providers: [CommitteesService],
  exports: [CommitteesService],
})
export class CommitteesModule {}
