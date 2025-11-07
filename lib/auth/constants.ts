// lib/auth/constants.ts

export const AUTH_COOKIE_NAME = "auth_session";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";

// From Technical Design Doc: Access Token 15min, Refresh Token 24h
export const TOKEN_EXPIRY = {
  ACCESS: 15 * 60, // 15 minutes in seconds
  REFRESH: 24 * 60 * 60, // 24 hours in seconds
};

export const PROTECTED_PATHS = [
  "/", // Root path (home)
  "/surat-tugas", // Exact match for surat-tugas (main listing page)
  "/employees/*", // Any routes under employees (if applicable)
];

export const PUBLIC_PATHS = [
  "/surat-tugas/*", // Surat tugas detail/validation pages (UUID routes) are public
  "/api/*", // API routes are public (handled by API itself)
  "/_next/*", // Next.js internal routes
  "/favicon.ico", // Favicon
  // Add other public paths if needed
];

// Optional: Path Patterns for different roles (based on your role hierarchy)
export const ROLE_PATHS = {
  SUPER_ADMIN: ["/admin/*"],
  ADMIN: ["/management/*"],
  MANAGEMENT: ["/department/*"],
  STAFF: ["/workspace/*"],
  VIEWER: ["/view/*"],
};
