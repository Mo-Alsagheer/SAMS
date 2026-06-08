import { Test, TestingModule } from '@nestjs/testing';
import { SessionsService } from './sessions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { MeetingsService } from '../meetings/meetings.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { Role } from '../../common/constants/role.enum';
import { AuthUser } from '../auth/auth.types';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('SessionsService', () => {
  let service: SessionsService;
  let repoMock: any;
  let meetingsMock: any;
  let roadmapMock: any;
  let auditMock: any;

  beforeEach(async () => {
    repoMock = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((session) => Promise.resolve({ id: 1, ...session })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    meetingsMock = {
      isRoomActive: jest.fn().mockResolvedValue(true),
      createMeeting: jest.fn().mockResolvedValue(undefined),
      getJoinToken: jest.fn().mockResolvedValue('token-abc'),
    };

    roadmapMock = {
      findOne: jest.fn(),
    };

    auditMock = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: repoMock,
        },
        {
          provide: MeetingsService,
          useValue: meetingsMock,
        },
        {
          provide: RoadmapService,
          useValue: roadmapMock,
        },
        {
          provide: AuditLogService,
          useValue: auditMock,
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const directorUser: AuthUser = {
      id: 10,
      email: 'dir@example.com',
      role: Role.DIRECTOR,
      committeeId: 2,
      name: 'Derek Director',
    };

    it('should throw ForbiddenException if user is not a director', async () => {
      const memberUser = { ...directorUser, role: Role.MEMBER };
      await expect(
        service.create({ title: 'Test', scheduledAt: '2026-06-06T12:00:00Z' }, memberUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if director is not assigned to a committee', async () => {
      const unassignedDirector = { ...directorUser, committeeId: null };
      await expect(
        service.create({ title: 'Test', scheduledAt: '2026-06-06T12:00:00Z' }, unassignedDirector),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if roadmap does not belong to director committee', async () => {
      roadmapMock.findOne.mockResolvedValue({ id: 5, committeeId: 9 }); // different committee
      await expect(
        service.create(
          { title: 'Test', scheduledAt: '2026-06-06T12:00:00Z', roadmapId: 5 },
          directorUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should successfully create session for director same committee', async () => {
      roadmapMock.findOne.mockResolvedValue({ id: 5, committeeId: 2 });
      const sessionDto = { title: 'Test Session', scheduledAt: '2026-06-06T12:00:00Z', roadmapId: 5 };
      const res = await service.create(sessionDto, directorUser);
      expect(res).toBeDefined();
      expect(res.committeeId).toBe(2);
      expect(res.creatorId).toBe(10);
    });
  });

  describe('getJoinToken', () => {
    const sessionMock = {
      id: 1,
      title: 'Session 1',
      committeeId: 2,
      roadmapId: null,
      plugnmeetRoomId: 'room-1',
      isRecorded: false,
    };

    it('should block standard member from joining another committee session', async () => {
      repoMock.findOne.mockResolvedValue(sessionMock);
      const memberUser: AuthUser = {
        id: 3,
        email: 'mem@example.com',
        role: Role.MEMBER,
        committeeId: 99, // different
        name: 'Member',
      };
      await expect(service.getJoinToken(1, memberUser)).rejects.toThrow(ForbiddenException);
    });

    it('should allow same committee member to join', async () => {
      repoMock.findOne.mockResolvedValue(sessionMock);
      const memberUser: AuthUser = {
        id: 3,
        email: 'mem@example.com',
        role: Role.MEMBER,
        committeeId: 2, // same
        name: 'Member',
      };
      const token = await service.getJoinToken(1, memberUser);
      expect(token).toBe('token-abc');
    });

    it('should allow executives to join any meeting', async () => {
      repoMock.findOne.mockResolvedValue(sessionMock);
      const execUser: AuthUser = {
        id: 1,
        email: 'exec@example.com',
        role: Role.EXECUTIVE,
        committeeId: null,
        name: 'Exec',
      };
      const token = await service.getJoinToken(1, execUser);
      expect(token).toBe('token-abc');
    });
  });
});
