import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlugNmeet, createRequest } from 'plugnmeet-sdk-js';
import { CreateRoomReqSchema, GenerateTokenReqSchema, FetchRecordingsReqSchema, IsRoomActiveReqSchema, RoomEndReqSchema } from 'plugnmeet-protocol-js';

@Injectable()
export class PlugnmeetService {
  private readonly logger = new Logger(PlugnmeetService.name);
  private plugnmeetClient: PlugNmeet;

  constructor(private readonly configService: ConfigService) {
    const serverUrl = this.configService.get<string>('PLUGNMEET_SERVER_URL');
    const apiKey = this.configService.get<string>('PLUGNMEET_API_KEY');
    const apiSecret = this.configService.get<string>('PLUGNMEET_API_SECRET');

    if (!serverUrl || !apiKey || !apiSecret) {
      this.logger.warn('plugNmeet credentials missing in .env');
    }

    this.plugnmeetClient = new PlugNmeet(serverUrl, apiKey, apiSecret);
  }

  /**
   * Creates a meeting room in plugNmeet
   */
  async createRoom(roomId: string, roomTitle: string, isRecorded: boolean) {
    try {
      const req = createRequest(CreateRoomReqSchema, {
        roomId: roomId,
        emptyTimeout: 60 * 60, // 1 hour empty timeout
        maxParticipants: 100,
        metadata: {
          roomTitle: roomTitle,
          welcomeMessage: `Welcome to ${roomTitle}`,
          isRecording: false,
          startedAt: '0',
          roomFeatures: {
            allowWebcams: true,
            muteOnStart: true,
            allowScreenShare: true,
            allowRtmp: false,
            allowViewOtherWebcams: true,
            allowViewOtherUsersList: true,
            adminOnlyWebcams: false,
            enableAnalytics: false,
            recordingFeatures: {
              isAllow: isRecorded,
              isAllowCloud: isRecorded,
              enableAutoCloudRecording: false,
              isAllowLocal: isRecorded,
              onlyRecordAdminWebcams: false,
            },
            chatFeatures: {
              isAllow: true,
              isAllowFileUpload: true,
              allowedFileTypes: [],
            },
            sharedNotePadFeatures: {
              isAllow: true,
              isActive: false,
              visible: false,
              nodeId: '',
              host: '',
              notePadId: '',
              readOnlyPadId: '',
            },
            whiteboardFeatures: {
              isAllow: true,
              visible: false,
              whiteboardFileId: '',
              fileName: '',
              filePath: '',
              totalPages: 0,
            },
            externalMediaPlayerFeatures: {
              isAllow: true,
              isActive: false,
            },
            waitingRoomFeatures: {
              isActive: false,
              waitingRoomMsg: '',
            },
            breakoutRoomFeatures: {
              isAllow: true,
              isActive: false,
              allowedNumberRooms: 6,
            },
            displayExternalLinkFeatures: {
              isAllow: true,
              isActive: false,
            },
            ingressFeatures: {
              isAllow: false,
            },
            speechToTextTranslationFeatures: {
              isAllow: false,
              isAllowTranslation: false,
            },
          },
        },
      });
      const response = await this.plugnmeetClient.createRoom(req);
      if (!response.status) {
        throw new Error(`plugNmeet API error: ${response.msg}`);
      }
      return response;
    } catch (error) {
      this.logger.error(`Error creating plugNmeet room: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generates a join token for a user
   */
  async getJoinToken(roomId: string, user: { id: string; name: string }, isDirector: boolean) {
    try {
      const req = createRequest(GenerateTokenReqSchema, {
        roomId: roomId,
        userInfo: {
          name: user.name,
          userId: user.id,
          isAdmin: isDirector,
          isHidden: false,
        },
      });
      const token = await this.plugnmeetClient.getJoinToken(req);
      if (!token.status) {
        throw new Error(`plugNmeet API error: ${token.msg}`);
      }
      return token;
    } catch (error) {
      this.logger.error(`Error getting plugNmeet join token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fetches recordings for a given room
   */
  async getRecordings(roomId: string) {
    try {
      const req = createRequest(FetchRecordingsReqSchema, {
        roomIds: [roomId],
      });
      const response = await this.plugnmeetClient.fetchRecordings(req);
      return response;
    } catch (error) {
      this.logger.error(`Error fetching plugNmeet recordings: ${error.message}`);
      throw error;
    }
  }

  /**
   * Checks if a room is active
   */
  async isRoomActive(roomId: string) {
    try {
      const req = createRequest(IsRoomActiveReqSchema, { roomId });
      const response = await this.plugnmeetClient.isRoomActive(req);
      return response.isActive;
    } catch (error) {
      this.logger.error(`Error checking if room is active: ${error.message}`);
      return false;
    }
  }

  /**
   * Ends an active room
   */
  async endRoom(roomId: string) {
    try {
      const req = createRequest(RoomEndReqSchema, { roomId });
      const response = await this.plugnmeetClient.endRoom(req);
      return response;
    } catch (error) {
      this.logger.error(`Error ending room: ${error.message}`);
      throw error;
    }
  }
}
