import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
// import { Committee } from './modules/committees/entities/committee.entity';
// import { CommitteeType } from './modules/committees/enums/committee-type.enum';
import { Session } from './modules/sessions/entities/session.entity';
// import { User, UserStatus } from './modules/users/entities/user.entity';
// import { Role } from './common/constants/role.enum';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  // const committeeRepository = app.get<Repository<Committee>>(
  //   getRepositoryToken(Committee),
  // );
  const sessionRepository = app.get<Repository<Session>>(
    getRepositoryToken(Session),
  );
  //const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  console.log('Seeding database...');

  // // 1. Seed 5 Committees
  // const committeesData = [
  //   {
  //     name: 'Software Development Committee',
  //     description:
  //       'Handles all core software projects and backend infrastructure.',
  //     type: CommitteeType.TECHNICAL,
  //     createdBy: 'exec-seed',
  //     directorIDs: [],
  //     membersCount: 0,
  //   },
  //   {
  //     name: 'Hardware & IoT Committee',
  //     description: 'Focuses on robotics, IoT, and hardware design.',
  //     type: CommitteeType.TECHNICAL,
  //     createdBy: 'exec-seed',
  //     directorIDs: [],
  //     membersCount: 0,
  //   },
  //   {
  //     name: 'Public Relations',
  //     description: 'Manages external communication and partnerships.',
  //     type: CommitteeType.OPERATION,
  //     createdBy: 'exec-seed',
  //     directorIDs: [],
  //     membersCount: 0,
  //   },
  //   {
  //     name: 'Human Resources',
  //     description: 'Responsible for recruitment and member evaluation.',
  //     type: CommitteeType.OPERATION,
  //     createdBy: 'exec-seed',
  //     directorIDs: [],
  //     membersCount: 0,
  //   },
  //   {
  //     name: 'Social Media & Design',
  //     description: 'Creates marketing material, posts, and visual designs.',
  //     type: CommitteeType.MEDIA,
  //     createdBy: 'exec-seed',
  //     directorIDs: [],
  //     membersCount: 0,
  //   },
  // ];

  // // const savedCommittees: Committee[] = [];
  // // for (const c of committeesData) {
  // //   let committee = await committeeRepository.findOne({
  // //     where: { name: c.name },
  // //   });
  // //   if (!committee) {
  // //     committee = committeeRepository.create(c);
  // //     await committeeRepository.save(committee);
  // //     console.log(`Created committee: ${committee.name}`);
  // //   }
  // //   savedCommittees.push(committee);
  // // }

  // // 2. Seed 3 Users
  // const usersData = [
  //   {
  //     name: 'Erin Executive',
  //     email: 'executive@example.com',
  //     password: 'password123',
  //     role: Role.EXECUTIVE,
  //     status: UserStatus.ACTIVE,
  //     committeeId: null, // Executive is system-wide
  //   },
  //   {
  //     name: 'Derek Director',
  //     email: 'director@example.com',
  //     password: 'password123',
  //     role: Role.DIRECTOR,
  //     status: UserStatus.ACTIVE,
  //     committeeId: savedCommittees[0].id, // Director of Software Development
  //   },
  //   {
  //     name: 'Uma Applicant',
  //     email: 'user@example.com',
  //     password: 'password123',
  //     role: Role.MEMBER,
  //     status: UserStatus.ACTIVE,
  //     committeeId: null, // Just an applicant/user without a committee yet
  //   },
  // ];

  // for (const u of usersData) {
  //   let user = await userRepository.findOne({ where: { email: u.email } });
  //   if (!user) {
  //     user = userRepository.create(u);
  //     await userRepository.save(user);
  //     console.log(`Created user: ${user.name}`);
  //   } else {
  //     console.log(`User already exists: ${user.name}`);
  //   }
  // }

  // Assign Derek Director to the committee
  // const softDevCommittee = savedCommittees[0];
  // const derek = await userRepository.findOne({
  //   where: { email: 'director@example.com' },
  // });
  // if (derek && !softDevCommittee.directorIDs.includes(derek.id)) {
  //   softDevCommittee.directorIDs.push(derek.id);
  //   await committeeRepository.save(softDevCommittee);
  //   console.log(
  //     `Assigned director ${derek.name} to committee ${softDevCommittee.name}`,
  //   );
  // }

  // 3. Seed 1 Session
  const sessionData = {
    title: 'Intro to NestJS & PlugNmeet',
    description: 'A kick-off session for the Software Development Committee.',
    scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
    isRecorded: true,
  };

  let session = await sessionRepository.findOne({
    where: { title: sessionData.title },
  });

  if (!session) {
    session = sessionRepository.create(sessionData);
    await sessionRepository.save(session);
    console.log(`Created session: ${session.title}`);
  } else {
    console.log(`Session already exists: ${session.title}`);
  }

  console.log('Database seeding complete!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Seeding failed', err);
  process.exit(1);
});
