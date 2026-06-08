import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { MeetingsService } from '../meetings/meetings.service';
import { AuthUser } from '../auth/auth.types';
import { Role } from '../../common/constants/role.enum';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RoadmapService } from '../roadmap/roadmap.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    private readonly meetingsService: MeetingsService,
    private readonly roadmapService: RoadmapService,
    private readonly audit: AuditLogService,
  ) {}

  async create(
    createSessionDto: CreateSessionDto,
    user: AuthUser,
  ): Promise<Session> {
    if (user.role !== Role.DIRECTOR) {
      throw new ForbiddenException('Only directors can schedule meetings');
    }
    if (user.committeeId == null) {
      throw new BadRequestException('Director is not assigned to any committee');
    }

    if (createSessionDto.roadmapId) {
      const roadmap = await this.roadmapService.findOne(
        createSessionDto.roadmapId,
      );
      if (!roadmap || roadmap.committeeId !== user.committeeId) {
        throw new ForbiddenException(
          'Roadmap does not belong to the director\'s committee',
        );
      }
    }

    this.audit
      .log({ action: 'SessionsService.create', body: { createSessionDto } })
      .catch(() => undefined);
    const session = this.sessionsRepository.create({
      ...createSessionDto,
      scheduledAt: new Date(createSessionDto.scheduledAt),
      isRecorded: createSessionDto.isRecorded ?? false,
      committeeId: user.committeeId,
      creatorId: user.id,
    });
    return this.sessionsRepository.save(session);
  }

  async findAll(roadmapId: number): Promise<Session[]> {
    return this.sessionsRepository.find({ where: { roadmapId } });
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
    user: AuthUser,
  ): Promise<Session> {
    const session = await this.findById(id);

    if (user.role !== Role.DIRECTOR) {
      throw new ForbiddenException('Only directors can update meetings');
    }
    if (session.committeeId !== user.committeeId) {
      throw new ForbiddenException(
        'You cannot update meetings outside your committee',
      );
    }

    Object.assign(session, {
      ...updateSessionDto,
      ...(updateSessionDto.scheduledAt !== undefined && {
        scheduledAt: new Date(updateSessionDto.scheduledAt),
      }),
    });
    return this.sessionsRepository.save(session);
  }

  async remove(id: number, user: AuthUser): Promise<void> {
    const session = await this.findById(id);

    if (user.role !== Role.DIRECTOR) {
      throw new ForbiddenException('Only directors can delete meetings');
    }
    if (session.committeeId !== user.committeeId) {
      throw new ForbiddenException(
        'You cannot delete meetings outside your committee',
      );
    }

    await this.sessionsRepository.remove(session);
  }

  async findById(id: number): Promise<Session> {
    const session = await this.sessionsRepository.findOne({ where: { id } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    return session;
  }

  async getJoinToken(sessionId: number, user: AuthUser) {
    const session = await this.findById(sessionId);

    // Executives are permitted to join any meeting room.
    if (user.role !== Role.EXECUTIVE) {
      if (!user.committeeId) {
        throw new ForbiddenException('You must be assigned to a committee to join a session');
      }

      let belongsToCommittee = false;
      if (session.committeeId && session.committeeId === user.committeeId) {
        belongsToCommittee = true;
      } else if (session.roadmapId) {
        const roadmap = await this.roadmapService.findOne(session.roadmapId);
        if (roadmap && roadmap.committeeId === user.committeeId) {
          belongsToCommittee = true;
        }
      }

      if (!belongsToCommittee) {
        throw new ForbiddenException('You can only join sessions belonging to your committee');
      }
    }

    const isDirector =
      user.role === Role.DIRECTOR || user.role === Role.EXECUTIVE;

    if (!session.plugnmeetRoomId) {
      throw new NotFoundException(
        'Meeting room has not been created for this session yet',
      );
    }

    if (isDirector) {
      const isActive = await this.meetingsService.isRoomActive(
        session.plugnmeetRoomId,
      );
      if (!isActive) {
        await this.meetingsService.createMeeting(
          session.plugnmeetRoomId,
          session.title,
          session.isRecorded,
        );
      }
    }

    return this.meetingsService.getJoinToken(
      session.plugnmeetRoomId,
      { id: String(user.id), name: user.name },
      isDirector,
    );
  }

  async getRecordings(sessionId: number) {
    const session = await this.findById(sessionId);
    if (!session.plugnmeetRoomId) {
      throw new NotFoundException(
        'Meeting room has not been created for this session yet',
      );
    }
    return this.meetingsService.getRecordings(session.plugnmeetRoomId);
  }

  async createMeeting(sessionId: number) {
    const session = await this.findById(sessionId);
    if (session.plugnmeetRoomId) {
      const isActive = await this.meetingsService.isRoomActive(
        session.plugnmeetRoomId,
      );
      if (isActive) {
        return {
          message: 'Meeting room already exists and is active',
          plugnmeetRoomId: session.plugnmeetRoomId,
        };
      }
    }

    const roomId = session.plugnmeetRoomId || `room-${session.id}`;

    await this.meetingsService.createMeeting(
      roomId,
      session.title,
      session.isRecorded,
    );

    if (!session.plugnmeetRoomId) {
      session.plugnmeetRoomId = roomId;
      await this.sessionsRepository.save(session);
    }

    return {
      message: 'Meeting room created successfully',
      plugnmeetRoomId: roomId,
    };
  }

  async endMeeting(sessionId: number) {
    const session = await this.findById(sessionId);
    if (!session.plugnmeetRoomId) {
      throw new NotFoundException(
        'Meeting room has not been created for this session yet',
      );
    }

    const isActive = await this.meetingsService.isRoomActive(
      session.plugnmeetRoomId,
    );
    if (!isActive) {
      return { message: 'Meeting room is already inactive or ended' };
    }

    await this.meetingsService.endMeeting(session.plugnmeetRoomId);
    return { message: 'Meeting room ended successfully' };
  }

  async findMyMeetings(user: AuthUser): Promise<Session[]> {
    if (user.role === Role.EXECUTIVE) {
      return this.sessionsRepository.find();
    }

    if (!user.committeeId) {
      return [];
    }

    return this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoin('roadmaps', 'roadmap', 'roadmap.id = session.roadmapId')
      .where(
        'session.committeeId = :committeeId OR roadmap.committeeId = :committeeId',
        { committeeId: user.committeeId },
      )
      .getMany();
  }
}
