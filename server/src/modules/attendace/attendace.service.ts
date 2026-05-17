import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendace } from './entities/attendace.entity';
import { Session } from '../sessions/entities/session.entity';
import { User, UserStatus } from '../users/entities/user.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { Committee } from '../committees/entities/committee.entity';
import { RoadmapService } from '../roadmap/roadmap.service';
import { Role } from '../../common/constants/role.enum';
export interface AttendanceMemberRow {
  userId: number;
  name: string;
  email: string;
  attended: boolean;
  score: number;
}

export interface UserCommitteeScore {
  committeeId: number;
  attendanceCount: number;
  attendancePoints: number;
  taskPoints: number;
  total: number;
}

export interface UserScoreBreakdown {
  userId: number;
  name: string;
  email: string;
  committees: UserCommitteeScore[];
}

@Injectable()
export class AttendaceService {
  constructor(
    @InjectRepository(Attendace)
    private readonly attendanceRepo: Repository<Attendace>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    private readonly roadmapService: RoadmapService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TaskSubmission)
    private readonly submissionRepo: Repository<TaskSubmission>,
    @InjectRepository(Committee)
    private readonly committeeRepo: Repository<Committee>,
  ) {}

  private async resolveCommitteeIdForSession(sessionId: number): Promise<{
    session: Session;
    committeeId: number;
  }> {
    const session = await this.sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new NotFoundException('Session not found');
    }
    if (session.roadmapId == null) {
      throw new BadRequestException('Session is not linked to a roadmap');
    }

    const roadmap = await this.roadmapService.findOne(session.roadmapId);
    if (roadmap.committeeId == null) {
      throw new BadRequestException('Roadmap is not assigned to a committee');
    }

    return { session, committeeId: roadmap.committeeId };
  }

  private async getCommitteeMembers(committeeId: number): Promise<User[]> {
    return this.userRepo.find({
      where: {
        committeeId,
        role: Role.MEMBER,
        status: UserStatus.ACTIVE,
      },
      order: { name: 'ASC' },
    });
  }

  async getSessionAttendance(sessionId: number): Promise<{
    sessionId: number;
    committeeId: number;
    members: AttendanceMemberRow[];
  }> {
    const { committeeId } = await this.resolveCommitteeIdForSession(sessionId);
    const members = await this.getCommitteeMembers(committeeId);

    const records = await this.attendanceRepo.find({
      where: { sessionId },
    });
    const recordByUserId = new Map(records.map((r) => [r.userId, r]));

    return {
      sessionId,
      committeeId,
      members: members.map((m) => {
        const record = recordByUserId.get(m.id);
        return {
          userId: m.id,
          name: m.name,
          email: m.email,
          attended: record?.attended ?? false,
          score: record?.score ?? 0,
        };
      }),
    };
  }

  async markAttendance(
    sessionId: number,
    membersData: { userId: number; score: number }[],
    directorId: number,
  ): Promise<{
    sessionId: number;
    committeeId: number;
    members: AttendanceMemberRow[];
  }> {
    const { committeeId } = await this.resolveCommitteeIdForSession(sessionId);
    const members = await this.getCommitteeMembers(committeeId);
    const memberIds = new Set(members.map((m) => m.id));
    
    const inputUserIds = membersData.map((m) => m.userId);
    const invalid = inputUserIds.filter((id) => !memberIds.has(id));
    if (invalid.length > 0) {
      throw new BadRequestException(
        `The following user IDs are not active members of this committee: ${invalid.join(', ')}`,
      );
    }

    const existingRecords = await this.attendanceRepo.find({
      where: { sessionId, committeeId },
    });
    const existingMap = new Map(existingRecords.map((r) => [r.userId, r]));

    for (const memberData of membersData) {
      const score = memberData.score;
      const attended = score > 0;
      
      const existing = existingMap.get(memberData.userId);

      if (existing) {
        existing.score = score;
        existing.attended = attended;
        existing.updatedBy = directorId;
        await this.attendanceRepo.save(existing);
      } else {
        await this.attendanceRepo.save(
          this.attendanceRepo.create({
            sessionId,
            userId: memberData.userId,
            committeeId,
            attended,
            score,
            createdBy: directorId,
            updatedBy: directorId,
          })
        );
      }
    }

    return this.getSessionAttendance(sessionId);
  }

  async getUserScore(userId: number): Promise<UserScoreBreakdown> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const attendanceRecords = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('DISTINCT a.committeeId', 'committeeId')
      .where('a.userId = :userId', { userId })
      .getRawMany<{ committeeId: number }>();

    const committeeIds = new Set<number>();
    attendanceRecords.forEach((r) => committeeIds.add(r.committeeId));

    if (user.committeeId != null) {
      committeeIds.add(user.committeeId);
    }

    if (committeeIds.size === 0) {
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        committees: [],
      };
    }

    const committeesScores = await Promise.all(
      Array.from(committeeIds).map((cid) =>
        this.buildScoreForUserCommittee(user, cid),
      ),
    );

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      committees: committeesScores,
    };
  }

  async getCommitteeScoreboardForDirector(
    committeeId: number,
    directorId: number,
  ): Promise<{
    committeeId: number;
    scores: {
      userId: number;
      name: string;
      email: string;
      committeeScore: UserCommitteeScore;
    }[];
  }> {
    const committee = await this.committeeRepo.findOne({
      where: { id: committeeId },
    });
    if (!committee) {
      throw new NotFoundException('Committee not found');
    }
    if (!committee.directorIDs.includes(directorId)) {
      throw new ForbiddenException('Director not assigned to this committee');
    }

    const members = await this.getCommitteeMembers(committeeId);
    const scores = await Promise.all(
      members.map(async (m) => {
        const cScore = await this.buildScoreForUserCommittee(m, committeeId);
        return {
          userId: m.id,
          name: m.name,
          email: m.email,
          committeeScore: cScore,
        };
      }),
    );

    return { committeeId, scores };
  }

  private async buildScoreForUserCommittee(
    user: User,
    committeeId: number,
  ): Promise<UserCommitteeScore> {
    const attendanceAgg = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('COUNT(a.id)', 'count')
      .addSelect('SUM(a.score)', 'totalScore')
      .where('a.userId = :userId', { userId: user.id })
      .andWhere('a.committeeId = :committeeId', { committeeId })
      .andWhere('a.attended = :attended', { attended: true })
      .getRawOne<{ count: string; totalScore: string }>();

    const attendanceCount = Number(attendanceAgg?.count ?? 0);
    const attendancePoints = Number(attendanceAgg?.totalScore ?? 0);

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
      committeeId,
      attendanceCount,
      attendancePoints,
      taskPoints: taskPointsNum,
      total: attendancePoints + taskPointsNum,
    };
  }
}
