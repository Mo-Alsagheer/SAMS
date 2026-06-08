import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { MeetingsService } from '../meetings/meetings.service';
import { AuthUser } from '../auth/auth.types';
import { Role } from '../../common/constants/role.enum';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    private readonly meetingsService: MeetingsService,
    private readonly audit: AuditLogService,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    this.audit
      .log({ action: 'SessionsService.create', body: { createSessionDto } })
      .catch(() => undefined);
    const session = this.sessionsRepository.create({
      ...createSessionDto,
      scheduledAt: new Date(createSessionDto.scheduledAt),
      isRecorded: createSessionDto.isRecorded ?? false,
    });
    return this.sessionsRepository.save(session);
  }

  async findAll(roadmapId: number): Promise<Session[]> {
    return this.sessionsRepository.find({ where: { roadmapId } });
  }

  async update(
    id: number,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.findById(id);
    Object.assign(session, {
      ...updateSessionDto,
      ...(updateSessionDto.scheduledAt !== undefined && {
        scheduledAt: new Date(updateSessionDto.scheduledAt),
      }),
    });
    return this.sessionsRepository.save(session);
  }

  async remove(id: number): Promise<void> {
    const session = await this.findById(id);
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
}
