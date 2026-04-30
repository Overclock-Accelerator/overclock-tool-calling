import { NextResponse } from 'next/server';

/**
 * Validate that the incoming request carries a valid CRM API key
 * in the `X-CRM-API-Key` header.
 */
export function validateCrmApiKey(request: Request): boolean {
  const key = request.headers.get('X-CRM-API-Key');
  const expected = process.env.CRM_API_KEY;

  if (!expected) {
    console.warn('CRM_API_KEY env var is not set — all CRM requests will be rejected.');
    return false;
  }

  return key === expected;
}

/**
 * Higher-order wrapper that gates a Next.js route handler behind CRM API key auth.
 *
 * Usage:
 * ```ts
 * export const GET = withCrmAuth(async (request) => {
 *   // handler logic — only runs if X-CRM-API-Key is valid
 *   return NextResponse.json({ ok: true });
 * });
 * ```
 */
export function withCrmAuth(
  handler: (request: Request, context?: unknown) => Promise<Response> | Response,
) {
  return async (request: Request, context?: unknown): Promise<Response> => {
    if (!validateCrmApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized — invalid or missing X-CRM-API-Key header' },
        { status: 401 },
      );
    }
    return handler(request, context);
  };
}
