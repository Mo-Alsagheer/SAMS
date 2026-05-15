import { Injectable } from '@nestjs/common';
import { PlugnmeetService } from '../../integrations/plugnmeet/plugnmeet.service';

@Injectable()
export class MeetingsService {
  constructor(private readonly plugnmeetService: PlugnmeetService) {}

  async createMeeting(roomId: string, roomTitle: string, isRecorded: boolean) {
    return this.plugnmeetService.createRoom(roomId, roomTitle, isRecorded);
  }

  async getJoinToken(roomId: string, user: { id: string; name: string }, isDirector: boolean) {
    return this.plugnmeetService.getJoinToken(roomId, user, isDirector);
  }

  async getRecordings(roomId: string) {
    return this.plugnmeetService.getRecordings(roomId);
  }

  async isRoomActive(roomId: string) {
    return this.plugnmeetService.isRoomActive(roomId);
  }

  async endMeeting(roomId: string) {
    return this.plugnmeetService.endRoom(roomId);
  }
}
