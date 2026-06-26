import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getFrontendOrigin } from './realtime.config';

describe('getFrontendOrigin (CORS configuration)', () => {
  const originalEnv = process.env['FRONTEND_ORIGIN'];

  beforeEach(() => {
    delete process.env['FRONTEND_ORIGIN'];
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env['FRONTEND_ORIGIN'] = originalEnv;
    } else {
      delete process.env['FRONTEND_ORIGIN'];
    }
  });

  it('returns the FRONTEND_ORIGIN env var when set', () => {
    process.env['FRONTEND_ORIGIN'] = 'http://custom-origin.example.com';
    expect(getFrontendOrigin()).toBe('http://custom-origin.example.com');
  });

  it('falls back to http://localhost:3000 when FRONTEND_ORIGIN is not set', () => {
    expect(getFrontendOrigin()).toBe('http://localhost:3000');
  });

  it('does not use a wildcard origin', () => {
    expect(getFrontendOrigin()).not.toBe('*');
    process.env['FRONTEND_ORIGIN'] = 'http://custom-origin.example.com';
    expect(getFrontendOrigin()).not.toBe('*');
  });
});
