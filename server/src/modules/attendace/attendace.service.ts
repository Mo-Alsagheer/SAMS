import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendace } from './entities/attendace.entity';
import { Session } from '../sessions/entities/session.entity';
import { Roadmap } from '../sessions/entities/roadmap.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { Role } from '../../common/constants/role.enum';

const ATTENDANCE_POINTS = 5;

export interface AttendanceMemberRow {
  userId: string;
  name: string;
  email: string;
  attended: boolean;
}

export interface UserScoreBreakdown {
  userId: string;
  name: string;
  email: string;
  attendanceCount: number;
  attendancePoints: number;
  taskPoints: number;
  total: number;
}

@Injectable()
export class AttendaceService {
  constructor(
    @InjectRepository(Attendace)
    private readonly attendanceRepo: Repository<Attendace>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Roadmap)
    private readonly roadmapRepo: Repository<Roadmap>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TaskSubmission)
    private readonly submissionRepo: Repository<TaskSubmission>,
  ) {}

  private async resolveCommitteeIdForSession(sessionId: string): Promise<{
    session: Session;
    committeeId: string;
  }> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (!session.roadmapId) {
      throw new BadRequestException('Session is not linked to a roadmap');
    }

    const roadmap = await this.roadmapRepo.findOne({
      where: { id: session.roadmapId },
    });
    if (!roadmap) {
      throw new NotFoundException('Roadmap not found for this session');
    }

    return { session, committeeId: roadmap.committeeId };
  }

  private async getCommitteeMembers(committeeId: string): Promise<User[]> {
    return this.userRepo.find({
      where: {
        committeeId,
        role: Role.MEMBER,
        status: UserStatus.ACTIVE,
      },
      order: { name: 'ASC' },
    });
  }

  async getSessionAttendance(sessionId: string): Promise<{
    sessionId: string;
    committeeId: string;
    members: AttendanceMemberRow[];
  }> {
    const { committeeId } = await this.resolveCommitteeIdForSession(sessionId);
    const members = await this.getCommitteeMembers(committeeId);

    const records = await this.attendanceRepo.find({
      where: { sessionId },
    });
    const attendedByUserId = new Map(
      records.map((r) => [r.userId, r.attended]),
    );

    return {
      sessionId,
      committeeId,
      members: members.map((m) => ({
        userId: m.id,
        name: m.name,
        email: m.email,
        attended: attendedByUserId.get(m.id) ?? false,
      })),
    };
  }

  async markAttendance(
    sessionId: string,
    userIds: string[],
  ): Promise<{ sessionId: string; committeeId: string; members: AttendanceMemberRow[] }> {
    const { committeeId } = await this.resolveCommitteeIdForSession(sessionId);
    const members = await this.getCommitteeMembers(committeeId);
    const memberIds = new Set(members.map((m) => m.id));

    const invalid = userIds.filter((id) => !memberIds.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `The following user IDs are not active members of this committee: ${invalid.join(', ')}`,
      );
    }

    const attendedSet = new Set(userIds);

    for (const member of members) {
      const attended = attendedSet.has(member.id);
      await this.attendanceRepo.upsert(
        { sessionId, userId: member.id, committeeId, attended },
        ['sessionId', 'userId'],
      );
    }

    return this.getSessionAttendance(sessionId);
  }

  async getUserScore(userId: string): Promise<UserScoreBreakdown> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const committeeId = user.committeeId;
    if (!committeeId) {
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        attendanceCount: 0,
        attendancePoints: 0,
        taskPoints: 0,
        total: 0,
      };
    }

    return this.buildScoreForUser(user, committeeId);
  }

  async getCommitteeScoreboard(committeeId: string): Promise<{
    committeeId: string;
    scores: UserScoreBreakdown[];
  }> {
    const members = await this.getCommitteeMembers(committeeId);
    const scores = await Promise.all(
      members.map((m) => this.buildScoreForUser(m, committeeId)),
    );

    return { committeeId, scores };
  }

  private async buildScoreForUser(
    user: User,
    committeeId: string,
  ): Promise<UserScoreBreakdown> {
    const { count } = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('COUNT(DISTINCT a.sessionId)', 'count')
      .where('a.userId = :userId', { userId: user.id })
      .andWhere('a.committeeId = :committeeId', { committeeId })
      .andWhere('a.attended = :attended', { attended: true })
      .getRawOne<{ count: string }>();

    const attendanceCount = Number(count ?? 0);
    const attendancePoints = attendanceCount * ATTENDANCE_POINTS;

    const { taskPoints } = await this.submissionRepo
      .createQueryBuilder('submission')
      .innerJoin('tasks', 'task', 'task.id = submission.taskId')
      .innerJoin('sessions', 'session', 'session.id = task.sessionId')
      .innerJoin('roadmaps', 'roadmap', 'roadmap.id = session.roadmapId')
      .select('COALESCE(SUM(submission.score), 0)', 'taskPoints')
      .where('submission.userId = :userId', { userId: user.id })
      .andWhere('roadmap.committeeId = :committeeId', { committeeId })
      .andWhere('submission.score IS NOT NULL')
      .getRawOne<{ taskPoints: string }>();

    const taskPointsNum = Number(taskPoints ?? 0);

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      attendanceCount,
      attendancePoints,
      taskPoints: taskPointsNum,
      total: attendancePoints + taskPointsNum,
    };
  }
}
