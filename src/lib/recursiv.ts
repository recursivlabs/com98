import { Recursiv } from '@recursiv/sdk';

export const BASE_URL =
  process.env.NEXT_PUBLIC_RECURSIV_API_URL || 'https://api.recursiv.io/api/v1';

// Public identifiers, not secrets. Hardcoded so production builds work even
// when Coolify env vars aren't propagated. NEXT_PUBLIC_* still wins for
// development overrides.
export const ORG_ID =
  process.env.NEXT_PUBLIC_RECURSIV_ORG_ID || '019ddf5b-8b7a-771c-aefc-dcf04e5dcfd1';

export const AGENT_ID =
  process.env.NEXT_PUBLIC_COM98_AGENT_ID || '716cacb6-0aa0-46d9-bcde-e02f7180e85a';

export function createAuthedSdk(apiKey: string): Recursiv {
  return new Recursiv({
    apiKey,
    baseUrl: BASE_URL,
    timeout: 120_000,
  });
}

export const anonSdk = new Recursiv({
  apiKey: 'anonymous',
  baseUrl: BASE_URL,
  timeout: 30_000,
} as any);
