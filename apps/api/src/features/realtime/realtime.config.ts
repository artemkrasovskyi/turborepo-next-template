export const getFrontendOrigin = (): string =>
  process.env['FRONTEND_ORIGIN'] ?? 'http://localhost:3000';
