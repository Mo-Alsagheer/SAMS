import { Injectable } from '@nestjs/common';
import { PlugnmeetService } from '../../integrations/plugnmeet/plugnmeet.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly plugnmeetService: PlugnmeetService,
    private readonly audit: AuditLogService,
  ) {}

  async createMeeting(roomId: string, roomTitle: string, isRecorded: boolean) {
    this.audit
      .log({
        action: 'MeetingsService.createMeeting',
        body: { roomId, roomTitle },
      })
      .catch(() => undefined);
    return this.plugnmeetService.createRoom(roomId, roomTitle, isRecorded);
  }

  async getJoinToken(
    roomId: string,
    user: { id: string; name: string },
    isDirector: boolean,
  ) {
    this.audit
      .log({
        action: 'MeetingsService.getJoinToken',
        body: { roomId, userId: user?.id },
      })
      .catch(() => undefined);
    return this.plugnmeetService.getJoinToken(roomId, user, isDirector);
  }

  async getRecordings(roomId: string) {
    this.audit
      .log({ action: 'MeetingsService.getRecordings', body: { roomId } })
      .catch(() => undefined);
    return this.plugnmeetService.getRecordings(roomId);
  }

  async isRoomActive(roomId: string) {
    return this.plugnmeetService.isRoomActive(roomId);
  }

  async endMeeting(roomId: string) {
    this.audit
      .log({ action: 'MeetingsService.endMeeting', body: { roomId } })
      .catch(() => undefined);
    return this.plugnmeetService.endRoom(roomId);
  }
}
