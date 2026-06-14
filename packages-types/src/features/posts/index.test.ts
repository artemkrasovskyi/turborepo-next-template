import { describe, expect, it } from 'vitest';
import { MAX_POST_LENGTH, validatePostBody } from './index';

describe('validatePostBody', () => {
  it('rejects an empty string', () => {
    expect(validatePostBody('')).toEqual({ error: 'Post cannot be empty.' });
  });

  it('rejects a whitespace-only string', () => {
    expect(validatePostBody('   ')).toEqual({ error: 'Post cannot be empty.' });
  });

  it('accepts a body at the maximum length', () => {
    const body = 'a'.repeat(MAX_POST_LENGTH);

    expect(validatePostBody(body)).toEqual({ trimmed: body });
  });

  it('rejects a body over the maximum length', () => {
    const body = 'a'.repeat(MAX_POST_LENGTH + 1);

    expect(validatePostBody(body)).toEqual({
      error: `Post must be ${MAX_POST_LENGTH} characters or fewer.`,
    });
  });

  it('trims surrounding whitespace', () => {
    expect(validatePostBody('  hello world  ')).toEqual({ trimmed: 'hello world' });
  });

  it('uses the Reply wording when kind is Reply', () => {
    expect(validatePostBody('', 'Reply')).toEqual({ error: 'Reply cannot be empty.' });

    const body = 'a'.repeat(MAX_POST_LENGTH + 1);

    expect(validatePostBody(body, 'Reply')).toEqual({
      error: `Reply must be ${MAX_POST_LENGTH} characters or fewer.`,
    });
  });
});
