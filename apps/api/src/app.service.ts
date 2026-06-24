/**
 * @openspec openspec/specs/node-api-app/spec.md
 * @change Backend-Phase-0-add-nestJS-api-app
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string } {
    return { status: 'ok' };
  }
}
