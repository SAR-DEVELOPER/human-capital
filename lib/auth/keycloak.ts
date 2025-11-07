// lib/auth/keycloak.ts
export const KEYCLOAK_CONFIG = {
  baseUrl: 'https://auth.centri.id',  // Keycloak server
  realm: 'BANTAL',      // Keycloak realm
  clientId: 'bantal-web',     // Keycloak client ID
  redirectUri: 'https://api.centri.id/auth/callback', // Backend callback URL
  clientSecret: 'G7sTzVljM1c8HFaibUwu7ugcBT5Ezn8u'
};

/**
 * Generate Keycloak login URL
 * Note: For human-capital app, we redirect to BANTAL-FE login page
 * which handles the Keycloak flow centrally
 */
export function getKeycloakLoginUrl(callbackUrl?: string) {
  // Redirect to main app's login page with callback URL
  const loginUrl = 'https://web.centri.id/auth/login';
  if (callbackUrl) {
    return `${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`;
  }
  return loginUrl;
}

/**
 * Direct Keycloak login URL (if needed for debugging or direct access)
 */
export function getDirectKeycloakLoginUrl() {
  return `${KEYCLOAK_CONFIG.baseUrl}/realms/${KEYCLOAK_CONFIG.realm}/protocol/openid-connect/auth?` +
    `client_id=${KEYCLOAK_CONFIG.clientId}&` +
    `redirect_uri=${encodeURIComponent(KEYCLOAK_CONFIG.redirectUri)}&` +
    'response_type=code&' +
    'scope=openid profile email';
}
