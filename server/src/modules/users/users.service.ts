import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from './entities/user.entity';
import { Committee } from '../committees/entities/committee.entity';
import { Attendace } from '../attendace/entities/attendace.entity';
import { Session } from '../sessions/entities/session.entity';
import { Task } from '../tasks/entities/task.entity';
import { TaskSubmission } from '../tasks/entities/task-submission.entity';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AttendaceService } from '../attendace/attendace.service';
import { AuthUser } from '../auth/auth.types';
import { Role } from '../../common/constants/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Committee)
    private readonly committeeRepo: Repository<Committee>,
    @InjectRepository(Attendace)
    private readonly attendanceRepo: Repository<Attendace>,
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskSubmission)
    private readonly submissionRepo: Repository<TaskSubmission>,
    private readonly attendanceService: AttendaceService,
    private readonly audit: AuditLogService,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    this.audit
      .log({ action: 'UsersService.findByEmail', body: { email } })
      .catch(() => undefined);
    return this.userRepository.findOne({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    this.audit
      .log({ action: 'UsersService.findById', body: { id } })
      .catch(() => undefined);
    return this.userRepository.findOne({ where: { id } });
  }

  list(): Promise<User[]> {
    this.audit.log({ action: 'UsersService.list' }).catch(() => undefined);
    return this.userRepository.find();
  }

  async listCommitteeMembers(user: AuthUser) {
    this.audit
      .log({ action: 'UsersService.listCommitteeMembers', userId: String(user.id) })
      .catch(() => undefined);

    let members: User[] = [];

    if (user.role === Role.EXECUTIVE) {
      members = await this.userRepository.find({
        where: { role: Role.MEMBER },
      });
    } else if (user.role === Role.DIRECTOR) {
      const committees = await this.committeeRepo
        .createQueryBuilder('c')
        .where(':directorId = ANY(c.directorIDs)', { directorId: user.id })
        .getMany();

      const committeeIds = committees.map((c) => c.id);
      if (committeeIds.length === 0) {
        return [];
      }

      members = await this.userRepository.find({
        where: {
          role: Role.MEMBER,
          committeeId: In(committeeIds),
        },
      });
    }

    const membersWithScores = await Promise.all(
      members.map(async (member) => {
        let score = 0;
        if (member.committeeId) {
          const scoreBreakdown = await this.attendanceService.buildScoreForUserCommittee(
            member,
            member.committeeId,
          );
          score = scoreBreakdown.total;
        }
        return {
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          status: member.status,
          score,
        };
      }),
    );

    return membersWithScores;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    this.audit
      .log({ action: 'UsersService.update', body: { id, updateUserDto } })
      .catch(() => undefined);

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async changePassword(
    id: number,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from the old password',
      );
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    this.audit
      .log({ action: 'UsersService.changePassword', body: { id } })
      .catch(() => undefined);
  }

  async changeStatus(
    targetUserId: number,
    status: UserStatus,
    requester: AuthUser,
  ): Promise<User> {
    const targetUser = await this.findById(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (requester.role === Role.DIRECTOR) {
      if (targetUser.role !== Role.MEMBER) {
        throw new ForbiddenException(
          'Directors can only change the status of committee members',
        );
      }

      if (!targetUser.committeeId) {
        throw new ForbiddenException(
          'The member is not assigned to any committee',
        );
      }

      const isAssigned = await this.committeeRepo
        .createQueryBuilder('c')
        .where('c.id = :committeeId', { committeeId: targetUser.committeeId })
        .andWhere(':directorId = ANY(c.directorIDs)', { directorId: requester.id })
        .getOne();

      if (!isAssigned) {
        throw new ForbiddenException(
          'You can only change the status of members in your own committee',
        );
      }
    }

    targetUser.status = status;
    const updated = await this.userRepository.save(targetUser);

    this.audit
      .log({
        action: 'UsersService.changeStatus',
        userId: String(requester.id),
        body: { targetUserId, status },
      })
      .catch(() => undefined);

    return updated;
  }

  async getCommitteeMembersStats(user: AuthUser) {
    this.audit
      .log({ action: 'UsersService.getCommitteeMembersStats', userId: String(user.id) })
      .catch(() => undefined);

    let members: User[] = [];
    let committeeIds: number[] = [];

    if (user.role === Role.EXECUTIVE) {
      members = await this.userRepository.find({
        where: { role: Role.MEMBER },
      });
      committeeIds = [
        ...new Set(members.map((m) => m.committeeId).filter((id) => id !== null)),
      ] as number[];
    } else if (user.role === Role.DIRECTOR) {
      const committees = await this.committeeRepo
        .createQueryBuilder('c')
        .where(':directorId = ANY(c.directorIDs)', { directorId: user.id })
        .getMany();

      committeeIds = committees.map((c) => c.id);
      if (committeeIds.length === 0) {
        return {
          totalMembers: 0,
          byStatus: { active: 0, hold: 0, fired: 0 },
          attendance: {
            totalSessions: 0,
            totalPresent: 0,
            totalLate: 0,
            totalAbsent: 0,
            averageAttendanceRate: 0,
          },
          tasks: {
            totalAssignedTasks: 0,
            totalSubmissions: 0,
            submissionRate: 0,
            averageTaskScore: 0,
          },
        };
      }

      members = await this.userRepository.find({
        where: {
          role: Role.MEMBER,
          committeeId: In(committeeIds),
        },
      });
    }

    const totalMembers = members.length;
    if (totalMembers === 0) {
      return {
        totalMembers: 0,
        byStatus: { active: 0, hold: 0, fired: 0 },
        attendance: {
          totalSessions: 0,
          totalPresent: 0,
          totalLate: 0,
          totalAbsent: 0,
          averageAttendanceRate: 0,
        },
        tasks: {
          totalAssignedTasks: 0,
          totalSubmissions: 0,
          submissionRate: 0,
          averageTaskScore: 0,
        },
      };
    }

    const byStatus = {
      active: members.filter((m) => m.status === UserStatus.ACTIVE).length,
      hold: members.filter((m) => m.status === UserStatus.HOLD).length,
      fired: members.filter((m) => m.status === UserStatus.FIRED).length,
    };

    const memberIds = members.map((m) => m.id);

    // Attendance stats
    const attendanceStats = await this.attendanceRepo
      .createQueryBuilder('a')
      .select('a.attended', 'status')
      .addSelect('COUNT(a.id)', 'count')
      .where('a.userId IN (:...memberIds)', { memberIds })
      .groupBy('a.attended')
      .getRawMany<{ status: string | null; count: string }>();

    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    for (const stat of attendanceStats) {
      const count = parseInt(stat.count, 10);
      if (stat.status === 'present') {
        totalPresent = count;
      } else if (stat.status === 'late') {
        totalLate = count;
      } else if (stat.status === 'absent') {
        totalAbsent = count;
      }
    }

    const totalMarkedSessions = totalPresent + totalLate + totalAbsent;
    const averageAttendanceRate =
      totalMarkedSessions > 0
        ? Math.round(((totalPresent + totalLate) / totalMarkedSessions) * 100)
        : 0;

    let totalSessions = 0;
    if (committeeIds.length > 0) {
      totalSessions = await this.sessionRepo
        .createQueryBuilder('s')
        .where('s.committeeId IN (:...committeeIds)', { committeeIds })
        .getCount();
    }

    // Task stats
    let totalAssignedTasks = 0;
    let totalSubmissions = 0;
    let averageTaskScore = 0;

    if (committeeIds.length > 0) {
      const tasks = await this.taskRepo
        .createQueryBuilder('t')
        .select('t.id', 'id')
        .addSelect('s.committeeId', 'committeeId')
        .innerJoin('sessions', 's', 's.id = t.sessionId')
        .where('s.committeeId IN (:...committeeIds)', { committeeIds })
        .getRawMany<{ id: number; committeeId: number }>();

      for (const member of members) {
        if (member.committeeId) {
          const memberCommitteeTasks = tasks.filter(
            (t) => t.committeeId === member.committeeId,
          );
          totalAssignedTasks += memberCommitteeTasks.length;
        }
      }

      const taskIds = tasks.map((t) => t.id);

      if (taskIds.length > 0) {
        const submissions = await this.submissionRepo
          .createQueryBuilder('sub')
          .where('sub.userId IN (:...memberIds)', { memberIds })
          .andWhere('sub.taskId IN (:...taskIds)', { taskIds })
          .getMany();

        totalSubmissions = submissions.length;

        const gradedSubmissions = submissions.filter(
          (sub) => sub.score !== null,
        );
        if (gradedSubmissions.length > 0) {
          const totalScore = gradedSubmissions.reduce(
            (sum, sub) => sum + (sub.score ?? 0),
            0,
          );
          averageTaskScore = parseFloat(
            (totalScore / gradedSubmissions.length).toFixed(2),
          );
        }
      }
    }

    const submissionRate =
      totalAssignedTasks > 0
        ? Math.round((totalSubmissions / totalAssignedTasks) * 100)
        : 0;

    return {
      totalMembers,
      byStatus,
      attendance: {
        totalSessions,
        totalPresent,
        totalLate,
        totalAbsent,
        averageAttendanceRate,
      },
      tasks: {
        totalAssignedTasks,
        totalSubmissions,
        submissionRate,
        averageTaskScore,
      },
    };
  }
}
