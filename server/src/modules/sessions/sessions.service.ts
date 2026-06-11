import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Session } from './entities/session.entity';
import { Material } from '../materials/entities/material.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { Attendace, AttendanceStatus } from '../attendace/entities/attendace.entity';
import { Committee } from '../committees/entities/committee.entity';
import { User } from '../users/entities/user.entity';
import { MeetingsService } from '../meetings/meetings.service';
import { AuthUser } from '../auth/auth.types';
import { Role } from '../../common/constants/role.enum';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RoadmapService } from '../roadmap/roadmap.service';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(Material)
    private readonly materialRepository: Repository<Material>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskSubmission)
    private readonly taskSubmissionRepository: Repository<TaskSubmission>,
    @InjectRepository(Attendace)
    private readonly attendanceRepository: Repository<Attendace>,
    @InjectRepository(Committee)
    private readonly committeeRepository: Repository<Committee>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
      isRecorded: createSessionDto.isRecorded ?? false,
      meetingType: createSessionDto.meetingType ?? null,
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

  async createMeeting(sessionId: number, dto: CreateMeetingDto) {
    const session = await this.findById(sessionId);

    session.scheduledAt = new Date(dto.scheduledAt);
    session.meetingType = dto.meetingType;
    await this.sessionsRepository.save(session);

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

  async findByCommitteeId(committeeId: number): Promise<Session[]> {
    return this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoin('roadmaps', 'roadmap', 'roadmap.id = session.roadmapId')
      .where(
        'session.committeeId = :committeeId OR roadmap.committeeId = :committeeId',
        { committeeId },
      )
      .getMany();
  }

  async getMemberExperience(user: AuthUser) {
    if (!user.committeeId) {
      throw new BadRequestException('User is not assigned to any committee');
    }

    const committee = await this.committeeRepository.findOne({
      where: { id: user.committeeId },
    });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }

    let directorName = 'N/A';
    if (committee.directorIDs && committee.directorIDs.length > 0) {
      const directors = await this.userRepository.find({
        where: { id: In(committee.directorIDs) },
      });
      directorName = directors.map((d) => d.name).join(', ') || 'N/A';
    }

    const sessions = await this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoin('roadmaps', 'roadmap', 'roadmap.id = session.roadmapId')
      .where(
        'session.committeeId = :committeeId OR roadmap.committeeId = :committeeId',
        { committeeId: committee.id },
      )
      .orderBy('session.scheduledAt', 'ASC')
      .getMany();

    const sessionIds = sessions.map((s) => s.id);
    const materials =
      sessionIds.length > 0
        ? await this.materialRepository.find({
            where: { sessionId: In(sessionIds) },
          })
        : [];
    const tasks =
      sessionIds.length > 0
        ? await this.taskRepository.find({
            where: { sessionId: In(sessionIds) },
          })
        : [];

    const taskIds = tasks.map((t) => t.id);
    const submissions =
      taskIds.length > 0
        ? await this.taskSubmissionRepository.find({
            where: { taskId: In(taskIds), userId: user.id },
          })
        : [];

    const attendanceList =
      sessionIds.length > 0
        ? await this.attendanceRepository.find({
            where: { userId: user.id, sessionId: In(sessionIds) },
          })
        : [];

    const activeRoomsResults = await Promise.all(
      sessions.map(async (sess) => {
        if (sess.plugnmeetRoomId) {
          try {
            const active = await this.meetingsService.isRoomActive(
              sess.plugnmeetRoomId,
            );
            return { sessionId: sess.id, active };
          } catch {
            return { sessionId: sess.id, active: false };
          }
        }
        return { sessionId: sess.id, active: false };
      }),
    );
    const activeRoomsMap = new Map(
      activeRoomsResults.map((r) => [r.sessionId, r.active]),
    );

    const now = new Date();
    let futureIndex = 0;

    const mappedSessions = sessions.map((s, index) => {
      const isRoomActive = activeRoomsMap.get(s.id) || false;
      let status = 'upcoming';

      if (isRoomActive) {
        status = 'live';
      } else if (s.scheduledAt < now) {
        status = 'completed';
      } else {
        if (futureIndex < 2) {
          status = 'upcoming';
        } else {
          status = 'locked';
        }
        futureIndex++;
      }

      const att = attendanceList.find((a) => a.sessionId === s.id);
      const attended = att ? (att.attended !== null && att.attended !== AttendanceStatus.ABSENT) : false;

      const sessMaterials = materials.filter((m) => m.sessionId === s.id);
      const resources = sessMaterials.map((m) => {
        const isPdf = m.fileUrl.toLowerCase().endsWith('.pdf');
        return {
          id: String(m.id),
          name: m.title,
          type: isPdf ? 'pdf' : 'link',
          url: m.fileUrl,
          size: isPdf ? '2.0 MB' : undefined,
        };
      });

      const sessTasks = tasks.filter((t) => t.sessionId === s.id);
      const mappedTasks = sessTasks.map((t) => {
        const sub = submissions.find((sub) => sub.taskId === t.id);
        let taskStatus = 'pending';
        if (sub) {
          taskStatus = sub.score !== null ? 'graded' : 'submitted';
        }
        return {
          id: String(t.id),
          sessionId: String(s.id),
          title: t.title,
          description: t.description || '',
          dueDate: t.dueDate.toISOString(),
          status: taskStatus,
          score: sub?.score ?? undefined,
          maxScore: 10,
          submissionUrl: sub?.fileUrl || sub?.content || undefined,
        };
      });

      const sessionObj: any = {
        id: String(s.id),
        order: index + 1,
        title: s.title,
        description: s.description || '',
        date: s.scheduledAt.toISOString(),
        duration: '90 min',
        status,
        resources,
        tasks: mappedTasks,
      };

      if (status === 'live') {
        sessionObj.meetingActive = true;
      }

      if (status === 'completed') {
        sessionObj.attended = attended;
        sessionObj.recordingUrl = s.isRecorded ? '#' : undefined;
      }

      return sessionObj;
    });

    const attendancePoints = mappedSessions.filter((s) => s.attended).length * 5;
    const taskPoints = mappedSessions
      .flatMap((s) => s.tasks)
      .reduce((sum, t) => sum + (t.score ?? 0), 0);

    const maxAttendance = mappedSessions.length * 5;
    const maxTasks = mappedSessions
      .flatMap((s) => s.tasks)
      .reduce((sum, t) => sum + t.maxScore, 0);

    const score = {
      total: attendancePoints + taskPoints,
      max: maxAttendance + maxTasks,
      attendance: attendancePoints,
      attendanceMax: maxAttendance,
      tasks: taskPoints,
      tasksMax: maxTasks,
      sessionsAttended: mappedSessions.filter((s) => s.attended).length,
      totalSessions: mappedSessions.length,
    };

    return {
      committee: {
        id: String(committee.id),
        name: committee.name,
        description: committee.description || '',
        director: directorName,
        totalSessions: mappedSessions.length,
      },
      sessions: mappedSessions,
      score,
    };
  }

  /**
   * Computes the data required for the member dashboard UI.
   * This leverages the heavy calculation from `getMemberExperience` and distills
   * it into a simpler structure with top-level stats and the latest tasks.
   * 
   * @param user The authenticated member object.
   * @returns Aggregated statistics, committee info, next session info, and recent tasks.
   */
  async getMemberDashboard(user: AuthUser) {
    const experience = await this.getMemberExperience(user);
    
    const completedSessions = experience.score.sessionsAttended;
    const allTasks = experience.sessions.flatMap(s => s.tasks);
    
    // Calculate pending tasks (due in the future and not submitted)
    // In getMemberExperience, tasks without submissions are 'pending'
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    
    let attendanceRate = 0;
    if (experience.score.totalSessions > 0) {
      attendanceRate = Math.round((completedSessions / experience.score.totalSessions) * 100);
    }
    
    // Find next active or upcoming session
    const nextSession = experience.sessions.find(s => s.status === 'live' || s.status === 'upcoming');
    
    // Get latest tasks (e.g. recently due or upcoming, sorted by dueDate desc)
    const latestTasks = [...allTasks]
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
      .slice(0, 3)
      .map(t => {
        let displayStatus = 'Pending';
        if (t.status === 'graded') displayStatus = 'Graded';
        if (t.status === 'submitted') displayStatus = 'Submitted';
        if (t.status === 'missed') displayStatus = 'Missed';
        
        return {
          id: t.id,
          title: t.title,
          status: displayStatus,
          score: t.score !== undefined ? `${t.score}/${t.maxScore}` : undefined,
        };
      });
      
    return {
      committee: experience.committee,
      stats: {
        completedSessions,
        pendingTasks,
        attendanceRate,
      },
      nextSession: nextSession ? {
        id: nextSession.id,
        title: nextSession.title,
        date: nextSession.date,
        status: nextSession.status === 'live' ? 'Live now' : 'Upcoming',
        meetingActive: nextSession.meetingActive,
      } : null,
      latestTasks,
    };
  }
}
