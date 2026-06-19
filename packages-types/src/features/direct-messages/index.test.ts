import { describe, expect, it } from 'vitest';
import {
  MAX_DIRECT_MESSAGE_LENGTH,
  validateDirectMessageBody,
} from './index';

describe('validateDirectMessageBody', () => {
  it('rejects empty messages', () => {
    expect(validateDirectMessageBody('   ')).toEqual({ error: 'Message cannot be empty.' });
  });

  it('trims valid messages', () => {
    expect(validateDirectMessageBody('  hello  ')).toEqual({ trimmed: 'hello' });
  });

  it('rejects over-limit messages', () => {
    const body = 'a'.repeat(MAX_DIRECT_MESSAGE_LENGTH + 1);

    expect(validateDirectMessageBody(body)).toEqual({
      error: `Message must be ${MAX_DIRECT_MESSAGE_LENGTH} characters or fewer.`,
    });
  });
});
